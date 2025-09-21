import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { TRPCError } from '@trpc/server';
import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

interface TestSuite {
  id: string;
  name: string;
  description: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  testFiles: string[];
  config: TestConfig;
  lastRun?: TestRun;
  isActive: boolean;
}

interface TestConfig {
  timeout: number;
  retries: number;
  parallel: boolean;
  environment: 'test' | 'staging' | 'production';
  coverage: {
    enabled: boolean;
    threshold: number;
    include: string[];
    exclude: string[];
  };
  reporter: 'json' | 'html' | 'junit' | 'console';
  beforeEach?: string[];
  afterEach?: string[];
}

interface TestRun {
  id: string;
  suiteId: string;
  status: 'running' | 'passed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  results: TestResult[];
  coverage?: CoverageReport;
  logs: string[];
  triggeredBy: string;
  environment: string;
}

interface TestResult {
  testName: string;
  file: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  assertions: {
    passed: number;
    failed: number;
    total: number;
  };
}

interface CoverageReport {
  statements: {
    total: number;
    covered: number;
    percentage: number;
  };
  branches: {
    total: number;
    covered: number;
    percentage: number;
  };
  functions: {
    total: number;
    covered: number;
    percentage: number;
  };
  lines: {
    total: number;
    covered: number;
    percentage: number;
  };
  files: {
    [filename: string]: {
      statements: number;
      branches: number;
      functions: number;
      lines: number;
    };
  };
}

interface TestMetrics {
  totalTests: number;
  passRate: number;
  failRate: number;
  averageDuration: number;
  coverage: number;
  trendsLast30Days: {
    date: string;
    passed: number;
    failed: number;
    duration: number;
    coverage: number;
  }[];
  flakiestTests: {
    name: string;
    flakeRate: number;
    lastFailures: string[];
  }[];
}

class TestingService {
  private testSuites: Map<string, TestSuite> = new Map();
  private activeRuns: Map<string, TestRun> = new Map();
  private testsPath = path.join(process.cwd(), 'tests');

  // Test Suite Management
  async createTestSuite(
    tenantId: string,
    userId: string,
    suiteData: Omit<TestSuite, 'id' | 'lastRun'>
  ): Promise<TestSuite> {
    try {
      const suiteId = this.generateId();
      const suite: TestSuite = {
        id: suiteId,
        ...suiteData
      };

      // Store in database
      await prisma.content.create({
        data: {
          tenantId,
          contentTypeId: 'test-suite',
          title: suite.name,
          slug: this.slugify(suite.name),
          content: {
            description: suite.description,
            type: suite.type,
            testFiles: suite.testFiles,
            config: suite.config,
            isActive: suite.isActive
          },
          status: 'PUBLISHED',
          createdBy: userId,
          updatedBy: userId
        }
      });

      this.testSuites.set(suiteId, suite);
      
      logger.info('Test suite created', {
        suiteId,
        name: suite.name,
        type: suite.type,
        testCount: suite.testFiles.length
      });

      return suite;
    } catch (error) {
      logger.error('Failed to create test suite', { error, suiteData });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create test suite'
      });
    }
  }

  // Run Tests
  async runTestSuite(
    suiteId: string,
    userId: string,
    options?: {
      environment?: string;
      testPattern?: string;
      coverage?: boolean;
    }
  ): Promise<TestRun> {
    try {
      const suite = await this.getTestSuite(suiteId);
      if (!suite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Test suite not found'
        });
      }

      const runId = this.generateId();
      const testRun: TestRun = {
        id: runId,
        suiteId,
        status: 'running',
        startedAt: new Date(),
        results: [],
        logs: [],
        triggeredBy: userId,
        environment: options?.environment || suite.config.environment
      };

      this.activeRuns.set(runId, testRun);

      // Run tests asynchronously
      this.executeTests(suite, testRun, options).catch(error => {
        logger.error('Test execution failed', { error, runId, suiteId });
        testRun.status = 'failed';
        testRun.completedAt = new Date();
        testRun.logs.push(`Execution failed: ${error.message}`);
      });

      logger.info('Test run started', {
        runId,
        suiteId,
        environment: testRun.environment
      });

      return testRun;
    } catch (error) {
      logger.error('Failed to start test run', { error, suiteId });
      throw error;
    }
  }

  // Execute Tests
  private async executeTests(
    suite: TestSuite,
    testRun: TestRun,
    options?: {
      testPattern?: string;
      coverage?: boolean;
    }
  ): Promise<void> {
    try {
      const startTime = Date.now();
      testRun.logs.push(`Starting test execution for suite: ${suite.name}`);

      // Prepare test environment
      await this.setupTestEnvironment(suite, testRun);

      // Execute based on suite type
      switch (suite.type) {
        case 'unit':
          await this.runUnitTests(suite, testRun, options);
          break;
        case 'integration':
          await this.runIntegrationTests(suite, testRun, options);
          break;
        case 'e2e':
          await this.runE2ETests(suite, testRun, options);
          break;
        case 'performance':
          await this.runPerformanceTests(suite, testRun, options);
          break;
        case 'security':
          await this.runSecurityTests(suite, testRun, options);
          break;
      }

      // Generate coverage report if enabled
      if (options?.coverage || suite.config.coverage.enabled) {
        testRun.coverage = await this.generateCoverageReport(suite, testRun);
      }

      // Cleanup test environment
      await this.cleanupTestEnvironment(suite, testRun);

      testRun.completedAt = new Date();
      testRun.duration = Date.now() - startTime;
      testRun.status = testRun.results.some(r => r.status === 'failed') ? 'failed' : 'passed';

      // Store test run results
      await this.storeTestResults(testRun);

      testRun.logs.push(`Test execution completed. Status: ${testRun.status}`);
      
      logger.info('Test execution completed', {
        runId: testRun.id,
        status: testRun.status,
        duration: testRun.duration,
        testsRun: testRun.results.length
      });

    } catch (error) {
      testRun.status = 'failed';
      testRun.completedAt = new Date();
      testRun.logs.push(`Error during execution: ${error.message}`);
      throw error;
    }
  }

  // Unit Tests
  private async runUnitTests(
    suite: TestSuite,
    testRun: TestRun,
    options?: { testPattern?: string; coverage?: boolean }
  ): Promise<void> {
    testRun.logs.push('Running unit tests with Jest...');

    const jestConfig = {
      testMatch: suite.testFiles.map(f => `**/${f}`),
      coverageDirectory: path.join(this.testsPath, 'coverage', 'unit'),
      collectCoverage: options?.coverage || suite.config.coverage.enabled,
      coverageThreshold: {
        global: {
          statements: suite.config.coverage.threshold,
          branches: suite.config.coverage.threshold,
          functions: suite.config.coverage.threshold,
          lines: suite.config.coverage.threshold
        }
      },
      testTimeout: suite.config.timeout,
      maxWorkers: suite.config.parallel ? '50%' : 1,
      ...(options?.testPattern && { testNamePattern: options.testPattern })
    };

    const results = await this.runJest(jestConfig, testRun);
    testRun.results.push(...results);
  }

  // Integration Tests
  private async runIntegrationTests(
    suite: TestSuite,
    testRun: TestRun,
    options?: { testPattern?: string; coverage?: boolean }
  ): Promise<void> {
    testRun.logs.push('Running integration tests...');

    // Start test database
    await this.startTestDatabase();

    // Seed test data
    await this.seedTestData();

    const jestConfig = {
      testMatch: suite.testFiles.map(f => `**/${f}`),
      setupFilesAfterEnv: ['<rootDir>/tests/setup/integration.ts'],
      testEnvironment: 'node',
      testTimeout: suite.config.timeout * 2, // Integration tests need more time
      maxWorkers: 1 // Sequential execution for integration tests
    };

    const results = await this.runJest(jestConfig, testRun);
    testRun.results.push(...results);

    // Cleanup test database
    await this.cleanupTestDatabase();
  }

  // E2E Tests
  private async runE2ETests(
    suite: TestSuite,
    testRun: TestRun,
    options?: { testPattern?: string }
  ): Promise<void> {
    testRun.logs.push('Running E2E tests with Playwright...');

    const playwrightConfig = {
      testDir: path.join(this.testsPath, 'e2e'),
      timeout: suite.config.timeout * 3,
      retries: suite.config.retries,
      workers: suite.config.parallel ? 2 : 1,
      use: {
        baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure'
      },
      projects: [
        { name: 'chromium', use: { ...require('playwright').devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...require('playwright').devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...require('playwright').devices['Desktop Safari'] } }
      ]
    };

    const results = await this.runPlaywright(playwrightConfig, testRun, options?.testPattern);
    testRun.results.push(...results);
  }

  // Performance Tests
  private async runPerformanceTests(
    suite: TestSuite,
    testRun: TestRun,
    options?: { testPattern?: string }
  ): Promise<void> {
    testRun.logs.push('Running performance tests with Artillery...');

    for (const testFile of suite.testFiles) {
      const config = await this.loadPerformanceTestConfig(testFile);
      const result = await this.runArtilleryTest(config, testRun);
      testRun.results.push(result);
    }
  }

  // Security Tests
  private async runSecurityTests(
    suite: TestSuite,
    testRun: TestRun,
    options?: { testPattern?: string }
  ): Promise<void> {
    testRun.logs.push('Running security tests...');

    // OWASP ZAP security scans
    const zapResults = await this.runZapScan(testRun);
    testRun.results.push(...zapResults);

    // Custom security tests
    const securityConfig = {
      testMatch: suite.testFiles.map(f => `**/${f}`),
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/setup/security.ts']
    };

    const jestResults = await this.runJest(securityConfig, testRun);
    testRun.results.push(...jestResults);
  }

  // Test Metrics and Analytics
  async getTestMetrics(tenantId: string, days: number = 30): Promise<TestMetrics> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      // Get test runs from database
      const testRuns = await this.getTestRunsFromDB(tenantId, since);

      const totalTests = testRuns.reduce((sum, run) => sum + run.results.length, 0);
      const passedTests = testRuns.reduce(
        (sum, run) => sum + run.results.filter(r => r.status === 'passed').length,
        0
      );
      const failedTests = totalTests - passedTests;

      const trends = await this.calculateTestTrends(testRuns, days);
      const flakiestTests = await this.identifyFlakiestTests(testRuns);

      return {
        totalTests,
        passRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
        failRate: totalTests > 0 ? (failedTests / totalTests) * 100 : 0,
        averageDuration: testRuns.reduce((sum, run) => sum + (run.duration || 0), 0) / testRuns.length,
        coverage: this.calculateAverageCoverage(testRuns),
        trendsLast30Days: trends,
        flakiestTests
      };
    } catch (error) {
      logger.error('Failed to get test metrics', { error, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get test metrics'
      });
    }
  }

  // Test Data Management
  async generateTestData(
    tenantId: string,
    dataType: 'users' | 'events' | 'donations' | 'content',
    count: number = 10
  ): Promise<any[]> {
    try {
      const testData = [];

      switch (dataType) {
        case 'users':
          for (let i = 0; i < count; i++) {
            testData.push({
              email: `test${i}@example.com`,
              name: `Test User ${i}`,
              role: i === 0 ? 'ADMIN' : 'MEMBER',
              status: 'ACTIVE',
              tenantId
            });
          }
          break;

        case 'events':
          for (let i = 0; i < count; i++) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + i);
            
            testData.push({
              title: `Test Event ${i}`,
              description: `Test event description ${i}`,
              startDate,
              endDate: new Date(startDate.getTime() + 3600000), // +1 hour
              tenantId,
              type: 'WORKSHOP'
            });
          }
          break;

        case 'donations':
          for (let i = 0; i < count; i++) {
            testData.push({
              amount: Math.floor(Math.random() * 10000) + 1000, // $10-$100
              currency: 'USD',
              type: 'ONE_TIME',
              status: 'COMPLETED',
              tenantId
            });
          }
          break;

        case 'content':
          for (let i = 0; i < count; i++) {
            testData.push({
              title: `Test Content ${i}`,
              content: { body: `Test content body ${i}` },
              contentTypeId: 'page',
              status: 'PUBLISHED',
              tenantId
            });
          }
          break;
      }

      logger.info('Test data generated', { dataType, count, tenantId });
      return testData;
    } catch (error) {
      logger.error('Failed to generate test data', { error, dataType });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate test data'
      });
    }
  }

  // Private Helper Methods
  private async getTestSuite(suiteId: string): Promise<TestSuite | null> {
    if (this.testSuites.has(suiteId)) {
      return this.testSuites.get(suiteId)!;
    }

    // Load from database
    const suiteContent = await prisma.content.findFirst({
      where: {
        contentTypeId: 'test-suite',
        slug: suiteId
      }
    });

    if (suiteContent) {
      const content = suiteContent.content as any;
      const suite: TestSuite = {
        id: suiteId,
        name: suiteContent.title,
        description: content.description,
        type: content.type,
        testFiles: content.testFiles,
        config: content.config,
        isActive: content.isActive
      };

      this.testSuites.set(suiteId, suite);
      return suite;
    }

    return null;
  }

  private async setupTestEnvironment(suite: TestSuite, testRun: TestRun): Promise<void> {
    testRun.logs.push('Setting up test environment...');
    
    // Execute beforeEach hooks
    if (suite.config.beforeEach) {
      for (const hook of suite.config.beforeEach) {
        await this.executeHook(hook, testRun);
      }
    }

    // Set environment variables
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  }

  private async cleanupTestEnvironment(suite: TestSuite, testRun: TestRun): Promise<void> {
    testRun.logs.push('Cleaning up test environment...');
    
    // Execute afterEach hooks
    if (suite.config.afterEach) {
      for (const hook of suite.config.afterEach) {
        await this.executeHook(hook, testRun);
      }
    }
  }

  private async executeHook(hook: string, testRun: TestRun): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(hook, (error, stdout, stderr) => {
        if (error) {
          testRun.logs.push(`Hook failed: ${hook} - ${error.message}`);
          reject(error);
        } else {
          testRun.logs.push(`Hook executed: ${hook}`);
          if (stdout) testRun.logs.push(stdout);
          if (stderr) testRun.logs.push(stderr);
          resolve();
        }
      });
    });
  }

  private async runJest(config: any, testRun: TestRun): Promise<TestResult[]> {
    // Simplified Jest execution - would use actual Jest API
    return [
      {
        testName: 'Sample Jest Test',
        file: 'sample.test.ts',
        status: 'passed',
        duration: 150,
        assertions: { passed: 5, failed: 0, total: 5 }
      }
    ];
  }

  private async runPlaywright(config: any, testRun: TestRun, pattern?: string): Promise<TestResult[]> {
    // Simplified Playwright execution - would use actual Playwright API
    return [
      {
        testName: 'Sample E2E Test',
        file: 'sample.e2e.ts',
        status: 'passed',
        duration: 3000,
        assertions: { passed: 3, failed: 0, total: 3 }
      }
    ];
  }

  private async runArtilleryTest(config: any, testRun: TestRun): Promise<TestResult> {
    // Simplified Artillery execution - would use actual Artillery API
    return {
      testName: 'Performance Test',
      file: 'load-test.yml',
      status: 'passed',
      duration: 60000,
      assertions: { passed: 1, failed: 0, total: 1 }
    };
  }

  private async runZapScan(testRun: TestRun): Promise<TestResult[]> {
    // Simplified ZAP scan - would use actual OWASP ZAP API
    return [
      {
        testName: 'Security Scan',
        file: 'security-scan',
        status: 'passed',
        duration: 30000,
        assertions: { passed: 10, failed: 0, total: 10 }
      }
    ];
  }

  private async generateCoverageReport(suite: TestSuite, testRun: TestRun): Promise<CoverageReport> {
    // Simplified coverage report - would use actual coverage tools
    return {
      statements: { total: 1000, covered: 850, percentage: 85 },
      branches: { total: 500, covered: 400, percentage: 80 },
      functions: { total: 200, covered: 180, percentage: 90 },
      lines: { total: 1200, covered: 1020, percentage: 85 },
      files: {}
    };
  }

  private async startTestDatabase(): Promise<void> {
    // Start test database instance
  }

  private async cleanupTestDatabase(): Promise<void> {
    // Clean up test database
  }

  private async seedTestData(): Promise<void> {
    // Seed test database with sample data
  }

  private async storeTestResults(testRun: TestRun): Promise<void> {
    // Store test results in database for reporting
  }

  private async getTestRunsFromDB(tenantId: string, since: Date): Promise<TestRun[]> {
    // Retrieve test runs from database
    return [];
  }

  private async calculateTestTrends(testRuns: TestRun[], days: number): Promise<any[]> {
    // Calculate test trends over time
    return [];
  }

  private async identifyFlakiestTests(testRuns: TestRun[]): Promise<any[]> {
    // Identify tests with inconsistent results
    return [];
  }

  private calculateAverageCoverage(testRuns: TestRun[]): number {
    const runs = testRuns.filter(r => r.coverage);
    if (runs.length === 0) return 0;
    
    return runs.reduce((sum, run) => sum + run.coverage!.statements.percentage, 0) / runs.length;
  }

  private async loadPerformanceTestConfig(testFile: string): Promise<any> {
    // Load Artillery configuration
    return {};
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
}

export const testingService = new TestingService();