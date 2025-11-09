/**
 * API Client and Fetcher Utilities
 *
 * Type-safe API client with error handling, retries, and interceptors
 */

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Request options
 */
export interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
  retry?: number;
  retryDelay?: number;
}

/**
 * API Response
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

/**
 * Interceptor function
 */
export type Interceptor<T> = (value: T) => T | Promise<T>;

/**
 * API Client Configuration
 */
export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: number;
  retryDelay?: number;
}

/**
 * API Client
 */
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private retry: number;
  private retryDelay: number;
  private requestInterceptors: Interceptor<RequestInit>[] = [];
  private responseInterceptors: Interceptor<Response>[] = [];

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = config.headers || {};
    this.timeout = config.timeout || 30000;
    this.retry = config.retry || 0;
    this.retryDelay = config.retryDelay || 1000;
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: Interceptor<RequestInit>): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: Interceptor<Response>): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    return url.toString();
  }

  /**
   * Make API request
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { params, timeout = this.timeout, retry = this.retry, retryDelay = this.retryDelay, ...init } = options;

    const url = this.buildUrl(endpoint, params);

    let requestInit: RequestInit = {
      ...init,
      headers: {
        ...this.defaultHeaders,
        ...init.headers,
      },
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      requestInit = await interceptor(requestInit);
    }

    // Attempt request with retries
    let lastError: Error | null = null;
    let attempts = 0;

    while (attempts <= retry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        let response = await fetch(url, {
          ...requestInit,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Apply response interceptors
        for (const interceptor of this.responseInterceptors) {
          response = await interceptor(response);
        }

        // Handle errors
        if (!response.ok) {
          const error = await this.handleError(response);
          throw error;
        }

        // Parse response
        const data = await this.parseResponse<T>(response);

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          throw error;
        }

        // Retry
        if (attempts < retry) {
          await this.sleep(retryDelay * Math.pow(2, attempts)); // Exponential backoff
          attempts++;
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Handle API errors
   */
  private async handleError(response: Response): Promise<ApiError> {
    let data: any;

    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }

    const message = data?.message || data?.error || response.statusText || 'An error occurred';

    return new ApiError(message, response.status, response.statusText, data);
  }

  /**
   * Parse API response
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return response.json();
    }

    if (contentType?.includes('text/')) {
      return response.text() as any;
    }

    if (contentType?.includes('application/octet-stream')) {
      return response.blob() as any;
    }

    // Default to JSON
    try {
      return response.json();
    } catch {
      return response.text() as any;
    }
  }

  /**
   * Sleep utility for retries
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Simple fetch wrapper
 */
export async function fetcher<T = any>(
  url: string,
  options?: RequestOptions
): Promise<T> {
  const { params, timeout = 30000, ...init } = options || {};

  // Build URL with params
  const urlWithParams = params
    ? `${url}?${new URLSearchParams(params as any).toString()}`
    : url;

  // Create timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(urlWithParams, {
      ...init,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(
        response.statusText,
        response.status,
        response.statusText
      );
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Create authenticated API client
 */
export function createAuthenticatedClient(
  config: ApiClientConfig,
  getToken: () => string | null
): ApiClient {
  const client = new ApiClient(config);

  // Add auth header interceptor
  client.addRequestInterceptor((request) => {
    const token = getToken();

    if (token) {
      return {
        ...request,
        headers: {
          ...request.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    }

    return request;
  });

  return client;
}

/**
 * SWR fetcher (for use with SWR library)
 */
export const swrFetcher = <T = any>(url: string): Promise<T> => {
  return fetcher<T>(url);
};

/**
 * React Query fetcher
 */
export const reactQueryFetcher = <T = any>({ queryKey }: { queryKey: [string, Record<string, any>?] }): Promise<T> => {
  const [url, params] = queryKey;
  return fetcher<T>(url, { params });
};

/**
 * Upload file
 */
export async function uploadFile(
  url: string,
  file: File,
  options: {
    fieldName?: string;
    additionalData?: Record<string, any>;
    onProgress?: (progress: number) => void;
  } = {}
): Promise<any> {
  const { fieldName = 'file', additionalData = {}, onProgress } = options;

  const formData = new FormData();
  formData.append(fieldName, file);

  // Add additional data
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          resolve(xhr.responseText);
        }
      } else {
        reject(new ApiError(xhr.statusText, xhr.status, xhr.statusText));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', url);
    xhr.send(formData);
  });
}

/**
 * Mock API client for testing
 */
export class MockApiClient {
  private handlers: Map<string, (options: RequestOptions) => Promise<any>> = new Map();

  /**
   * Register mock handler
   */
  on(endpoint: string, handler: (options: RequestOptions) => Promise<any>): void {
    this.handlers.set(endpoint, handler);
  }

  /**
   * Make mock request
   */
  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const handler = this.handlers.get(endpoint);

    if (!handler) {
      throw new ApiError('Not found', 404, 'Not Found');
    }

    const data = await handler(options);

    return {
      data,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
    };
  }

  get = (endpoint: string, options?: RequestOptions) => this.request(endpoint, { ...options, method: 'GET' });
  post = (endpoint: string, data?: any, options?: RequestOptions) => this.request(endpoint, { ...options, method: 'POST', body: data });
  put = (endpoint: string, data?: any, options?: RequestOptions) => this.request(endpoint, { ...options, method: 'PUT', body: data });
  patch = (endpoint: string, data?: any, options?: RequestOptions) => this.request(endpoint, { ...options, method: 'PATCH', body: data });
  delete = (endpoint: string, options?: RequestOptions) => this.request(endpoint, { ...options, method: 'DELETE' });
}

/**
 * Batch requests
 */
export async function batchRequests<T = any>(
  requests: (() => Promise<T>)[],
  options: {
    concurrency?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<T[]> {
  const { concurrency = 5, onProgress } = options;
  const results: T[] = [];
  const total = requests.length;
  let completed = 0;

  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(req => req()));
    results.push(...batchResults);

    completed += batch.length;
    onProgress?.(completed, total);
  }

  return results;
}

/**
 * Example usage
 */
export const exampleUsage = `
// Create API client
const api = new ApiClient({
  baseUrl: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  retry: 3,
});

// Add auth interceptor
api.addRequestInterceptor((request) => {
  const token = localStorage.getItem('token');
  if (token) {
    return {
      ...request,
      headers: {
        ...request.headers,
        Authorization: \`Bearer \${token}\`,
      },
    };
  }
  return request;
});

// Make requests
const { data } = await api.get('/users', { params: { page: 1 } });
const { data: user } = await api.post('/users', { name: 'John' });
const { data: updated } = await api.put('/users/1', { name: 'Jane' });
await api.delete('/users/1');

// Upload file
await uploadFile('/upload', file, {
  onProgress: (progress) => console.log(\`\${progress}%\`),
});

// With SWR
import useSWR from 'swr';

function Component() {
  const { data, error } = useSWR('/api/users', swrFetcher);
  // ...
}

// With React Query
import { useQuery } from '@tanstack/react-query';

function Component() {
  const { data, error } = useQuery({
    queryKey: ['/api/users', { page: 1 }],
    queryFn: reactQueryFetcher,
  });
  // ...
}
`;
