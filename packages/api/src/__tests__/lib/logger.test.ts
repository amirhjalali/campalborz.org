import logger from '../../lib/logger';

describe('logger', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    error: jest.SpyInstance;
    warn: jest.SpyInstance;
    debug: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log info messages with timestamp', () => {
    logger.info('test message');
    expect(consoleSpy.log).toHaveBeenCalledTimes(1);
    const args = consoleSpy.log.mock.calls[0];
    expect(args[0]).toBe('[INFO]');
    // Second argument should be an ISO timestamp
    expect(args[1]).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(args[2]).toBe('test message');
  });

  it('should log error messages with timestamp', () => {
    logger.error('error occurred');
    expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    const args = consoleSpy.error.mock.calls[0];
    expect(args[0]).toBe('[ERROR]');
    expect(args[1]).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(args[2]).toBe('error occurred');
  });

  it('should log warning messages with timestamp', () => {
    logger.warn('warning message');
    expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
    const args = consoleSpy.warn.mock.calls[0];
    expect(args[0]).toBe('[WARN]');
    expect(args[1]).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(args[2]).toBe('warning message');
  });

  it('should log debug messages only in development', () => {
    const originalEnv = process.env.NODE_ENV;

    process.env.NODE_ENV = 'development';
    logger.debug('debug message');
    expect(consoleSpy.debug).toHaveBeenCalledTimes(1);
    const args = consoleSpy.debug.mock.calls[0];
    expect(args[0]).toBe('[DEBUG]');
    expect(args[2]).toBe('debug message');

    process.env.NODE_ENV = originalEnv;
  });

  it('should not log debug messages in production', () => {
    const originalEnv = process.env.NODE_ENV;

    process.env.NODE_ENV = 'production';
    logger.debug('should not appear');
    expect(consoleSpy.debug).not.toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });

  it('should handle multiple arguments', () => {
    logger.info('message', { key: 'value' }, 42);
    expect(consoleSpy.log).toHaveBeenCalledTimes(1);
    const args = consoleSpy.log.mock.calls[0];
    expect(args[2]).toBe('message');
    expect(args[3]).toEqual({ key: 'value' });
    expect(args[4]).toBe(42);
  });
});
