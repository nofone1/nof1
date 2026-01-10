/**
 * React hook for using the logger with automatic screen context.
 * Provides a convenient way to log events with the current screen name attached.
 *
 * @example
 * ```typescript
 * function HomeScreen() {
 *   const { log } = useLogger('HomeScreen');
 *
 *   const handlePress = () => {
 *     log.info('Button pressed');
 *   };
 * }
 * ```
 */

import { useCallback, useMemo } from "react";
import { logger, LogLevel, type LogContext } from "@/services/logging";

/**
 * Return type for the useLogger hook.
 * @property log - Object with methods for each log level
 * @property setContext - Method to set additional global context
 */
interface UseLoggerReturn {
  log: {
    debug: (message: string, context?: Omit<LogContext, "screenName">) => void;
    info: (message: string, context?: Omit<LogContext, "screenName">) => void;
    warn: (message: string, context?: Omit<LogContext, "screenName">) => void;
    error: (
      message: string,
      context?: Omit<LogContext, "screenName">,
      error?: Error
    ) => void;
  };
  setContext: (context: Partial<LogContext>) => void;
}

/**
 * Hook for logging with automatic screen context.
 * @param screenName - Name of the current screen to attach to all logs
 * @returns Object with logging methods and context setter
 *
 * @example
 * ```typescript
 * function ExperimentDetailScreen({ route }) {
 *   const { experimentId } = route.params;
 *   const { log, setContext } = useLogger('ExperimentDetail');
 *
 *   useEffect(() => {
 *     setContext({ experimentId });
 *   }, [experimentId]);
 *
 *   const handleSave = () => {
 *     log.info('Saving experiment');
 *   };
 * }
 * ```
 */
export function useLogger(screenName: string): UseLoggerReturn {
  /**
   * Creates context with screen name attached.
   */
  const createContext = useCallback(
    (context?: Omit<LogContext, "screenName">): LogContext => ({
      screenName,
      ...context,
    }),
    [screenName]
  );

  /**
   * Logging methods with screen context automatically attached.
   */
  const log = useMemo(
    () => ({
      debug: (message: string, context?: Omit<LogContext, "screenName">) => {
        logger.debug(message, createContext(context));
      },
      info: (message: string, context?: Omit<LogContext, "screenName">) => {
        logger.info(message, createContext(context));
      },
      warn: (message: string, context?: Omit<LogContext, "screenName">) => {
        logger.warn(message, createContext(context));
      },
      error: (
        message: string,
        context?: Omit<LogContext, "screenName">,
        error?: Error
      ) => {
        logger.error(message, createContext(context), error);
      },
    }),
    [createContext]
  );

  /**
   * Sets additional global context for the logger.
   */
  const setContext = useCallback((context: Partial<LogContext>) => {
    logger.setContext(context);
  }, []);

  return { log, setContext };
}
