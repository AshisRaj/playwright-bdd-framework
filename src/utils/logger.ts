import path from 'path';
import fs from 'fs';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
// Note: Can't use @utils here because of circular dependency issues with logger.ts and paths.ts.
// So we import the constant directly from paths.ts instead of using @utils.
import { ARTIFACTS_DIR } from './paths';

const LOG_DIR = path.join(ARTIFACTS_DIR, 'logs');
fs.mkdirSync(LOG_DIR, { recursive: true });

const consoleFormat = winston.format.printf(
  ({ timestamp, level, message }) => `${timestamp} [${level}] ${message}`,
);

const fileFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

export const logger = winston.createLogger({
  // level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        consoleFormat,
      ),
    }),
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'test-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
      format: fileFormat,
    }),
  ],
});
