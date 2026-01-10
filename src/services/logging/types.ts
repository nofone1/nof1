/**
 * Types for the logging service.
 * Defines log levels, entry structure, and configuration options.
 */

/**
 * Available log levels in order of severity.
 * DEBUG < INFO < WARN < ERROR
 */
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

/**
 * Numeric values for log levels to enable filtering.
 */
export const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

/**
 * Represents additional context attached to a log entry.
 * @property screenName - Current screen when log was created
 * @property userId - ID of the logged-in user (if any)
 * @property experimentId - ID of related experiment (if applicable)
 * @property extra - Any additional contextual data
 */
export interface LogContext {
  screenName?: string;
  userId?: string;
  experimentId?: string;
  extra?: Record<string, unknown>;
}

/**
 * Represents a single log entry.
 * @property id - Unique identifier for the log entry
 * @property level - Severity level of the log
 * @property message - Human-readable log message
 * @property timestamp - ISO timestamp when log was created
 * @property context - Optional contextual information
 * @property error - Error details if logging an error
 */
export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Configuration options for the logger.
 * @property minLevel - Minimum log level to record
 * @property enableConsole - Whether to output logs to console
 * @property enableStorage - Whether to persist logs to async storage
 * @property maxStoredLogs - Maximum number of logs to keep in storage
 * @property enableRemote - Whether to send logs to a remote service (future)
 */
export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStoredLogs: number;
  enableRemote: boolean;
}

/**
 * Default logger configuration.
 * Logs INFO and above to console, stores up to 500 logs locally.
 */
export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  minLevel: LogLevel.INFO,
  enableConsole: __DEV__,
  enableStorage: true,
  maxStoredLogs: 500,
  enableRemote: false,
};

/**
 * Interface for log transport implementations.
 * Allows plugging in different log destinations.
 */
export interface LogTransport {
  /**
   * Sends a log entry to the transport destination.
   * @param entry - The log entry to send
   * @returns Promise that resolves when log is sent
   */
  log(entry: LogEntry): Promise<void>;

  /**
   * Flushes any buffered logs.
   * @returns Promise that resolves when flush is complete
   */
  flush(): Promise<void>;
}
