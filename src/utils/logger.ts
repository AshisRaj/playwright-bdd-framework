import fs from 'fs';
import path from 'path';
import winston, { createLogger, format } from 'winston';

// Note: Can't use @utils here because of circular dependency issues with logger.ts and paths.ts.
// So we import the constant directly from paths.ts instead of using @utils.
import { ARTIFACTS_DIR } from './paths';

const LOG_DIR = path.join(ARTIFACTS_DIR, 'logs');
fs.mkdirSync(LOG_DIR, { recursive: true });

// Define your custom format combining timestamps, error stacks, and colors
export const logger = createLogger({
  level: 'debug', // Captures debug (5), info (2), and error (0) priorities
  format: format.combine(
    format.errors({ stack: true }), // Crucial for printing structural error stack traces
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.colorize(),
    format.printf(({ timestamp, level, message, stack, ...meta }) => {
      // Print the stack trace if an error object exists; otherwise print standard message
      const logMessage = stack ? `${message}\n${stack}` : message;
      // Convert extra metadata objects to string format if present
      const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';

      return `[${timestamp}] ${level}: ${logMessage}${metaString}`;
    }),
  ),
  transports: [
    //
    // - Write all logs with importance level of `error` or higher to `error.log`
    //   (i.e., error, fatal, but not other levels)
    //
    new winston.transports.File({ filename: path.join(LOG_DIR, 'error.log'), level: 'error' }),
    //
    // - Write all logs with importance level of `info` or higher to `combined.log`
    //   (i.e., fatal, error, warn, and info, but not trace)
    //
    new winston.transports.File({ filename: path.join(LOG_DIR, 'combined.log') }),

    new winston.transports.Console(),
  ],
});
