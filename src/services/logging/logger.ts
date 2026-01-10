/**
 * Centralized logging service for the N-of-1 app.
 * Provides structured logging with levels, context capture, and storage.
 *
 * Features:
 * - Multiple log levels (DEBUG, INFO, WARN, ERROR)
 * - Automatic context capture (timestamp, screen, user)
 * - Local storage persistence for offline access
 * - Extensible transport system for future remote logging
 *
 * @example
 * ```typescript
 * import { logger } from '@/services/logging/logger';
 *
 * // Basic logging
 * logger.info('User signed in');
 * logger.warn('API response slow', { extra: { responseTime: 5000 } });
 * logger.error('Failed to save experiment', { experimentId: '123' }, error);
 * ```
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LogLevel,
  LogEntry,
  LogContext,
  LoggerConfig,
  DEFAULT_LOGGER_CONFIG,
  LOG_LEVEL_VALUES,
} from "./types";

const STORAGE_KEY = "@nof1/logs";

/**
 * Generates a unique identifier for log entries.
 * Uses timestamp + random string for uniqueness.
 * @returns A unique string ID
 */
const generateLogId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
};

/**
 * Logger class providing structured logging functionality.
 * Singleton instance available via the `logger` export.
 */
class Logger {
  private config: LoggerConfig;
  private currentContext: LogContext = {};
  private logQueue: LogEntry[] = [];
  private isFlushingLogs = false;

  /**
   * Creates a new Logger instance.
   * @param config - Optional configuration to override defaults
   */
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...config };
  }

  /**
   * Updates the logger configuration.
   * @param config - Partial config to merge with existing
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Sets global context that will be attached to all subsequent logs.
   * Useful for setting user ID after authentication.
   * @param context - Context to merge with existing global context
   */
  public setContext(context: Partial<LogContext>): void {
    this.currentContext = { ...this.currentContext, ...context };
  }

  /**
   * Clears the global context.
   * Should be called on user sign out.
   */
  public clearContext(): void {
    this.currentContext = {};
  }

  /**
   * Logs a debug message.
   * Use for detailed diagnostic information during development.
   * @param message - The log message
   * @param context - Optional additional context
   */
  public debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Logs an info message.
   * Use for general operational events (user actions, state changes).
   * @param message - The log message
   * @param context - Optional additional context
   */
  public info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Logs a warning message.
   * Use for potentially problematic situations that don't cause errors.
   * @param message - The log message
   * @param context - Optional additional context
   */
  public warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Logs an error message with optional error object.
   * Use for errors that affect functionality.
   * @param message - The log message
   * @param context - Optional additional context
   * @param error - Optional Error object to include stack trace
   */
  public error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Core logging method that handles all log levels.
   * @param level - The severity level
   * @param message - The log message
   * @param context - Optional additional context
   * @param error - Optional Error object
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    // Check if this log level should be recorded
    if (LOG_LEVEL_VALUES[level] < LOG_LEVEL_VALUES[this.config.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      id: generateLogId(),
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.currentContext, ...context },
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };

    // Output to console in development
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Queue for storage
    if (this.config.enableStorage) {
      this.queueForStorage(entry);
    }
  }

  /**
   * Outputs a log entry to the console with appropriate formatting.
   * @param entry - The log entry to output
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.level.toUpperCase()}]`;
    const timestamp = entry.timestamp.split("T")[1].split(".")[0];
    const contextStr = entry.context?.screenName
      ? ` (${entry.context.screenName})`
      : "";

    const formattedMessage = `${prefix} ${timestamp}${contextStr}: ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, entry.context?.extra || "");
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, entry.context?.extra || "");
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, entry.context?.extra || "");
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, entry.error || entry.context?.extra || "");
        break;
    }
  }

  /**
   * Adds a log entry to the storage queue.
   * @param entry - The log entry to queue
   */
  private queueForStorage(entry: LogEntry): void {
    this.logQueue.push(entry);

    // Debounce storage writes
    if (!this.isFlushingLogs) {
      this.isFlushingLogs = true;
      setTimeout(() => this.flushToStorage(), 1000);
    }
  }

  /**
   * Persists queued logs to async storage.
   * Maintains a rolling window of logs based on maxStoredLogs config.
   */
  private async flushToStorage(): Promise<void> {
    if (this.logQueue.length === 0) {
      this.isFlushingLogs = false;
      return;
    }

    try {
      const existingLogsJson = await AsyncStorage.getItem(STORAGE_KEY);
      const existingLogs: LogEntry[] = existingLogsJson
        ? JSON.parse(existingLogsJson)
        : [];

      // Combine and trim to max size
      const allLogs = [...existingLogs, ...this.logQueue];
      const trimmedLogs = allLogs.slice(-this.config.maxStoredLogs);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedLogs));
      this.logQueue = [];
    } catch (error) {
      // Don't log errors from the logger itself to avoid infinite loops
      console.error("Failed to persist logs:", error);
    } finally {
      this.isFlushingLogs = false;
    }
  }

  /**
   * Retrieves all stored logs.
   * Useful for debugging or exporting logs.
   * @returns Promise resolving to array of stored log entries
   */
  public async getStoredLogs(): Promise<LogEntry[]> {
    try {
      const logsJson = await AsyncStorage.getItem(STORAGE_KEY);
      return logsJson ? JSON.parse(logsJson) : [];
    } catch (error) {
      console.error("Failed to retrieve logs:", error);
      return [];
    }
  }

  /**
   * Clears all stored logs.
   * @returns Promise that resolves when logs are cleared
   */
  public async clearStoredLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear logs:", error);
    }
  }

  /**
   * Forces immediate flush of any queued logs.
   * Call this before app termination to ensure logs are saved.
   * @returns Promise that resolves when flush is complete
   */
  public async flush(): Promise<void> {
    await this.flushToStorage();
  }
}

/**
 * Singleton logger instance for application-wide use.
 * Import this in components and services to log events.
 *
 * @example
 * ```typescript
 * import { logger } from '@/services/logging/logger';
 *
 * logger.info('Experiment created', { experimentId: '123' });
 * ```
 */
export const logger = new Logger();

/**
 * Export the Logger class for custom instances if needed.
 */
export { Logger };
