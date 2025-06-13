import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.json(),
);

// Create logs directory if it doesn't exist
const fs = winston.transports.File.prototype.dirname = './logs';
if (!fs.existsSync) {
  fs.mkdirSync(fs, { recursive: true });
}

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
  }),
  // Error log file transport
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: fileFormat,
  }),
  // Combined log file transport
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: fileFormat,
  }),
];

// Create logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan
export const stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

export default logger;