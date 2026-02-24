import * as SecureStore from 'expo-secure-store';

/**
 * Retrieves the stored authentication token from secure storage.
 * Returns null if no token is stored or if an error occurs.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('accessToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Stores the authentication token in secure storage.
 */
export async function setAuthToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync('accessToken', token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
}

/**
 * Removes the authentication token from secure storage.
 */
export async function clearAuthToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync('accessToken');
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
}
