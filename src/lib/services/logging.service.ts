// src/lib/services/logging.service.ts

interface LogContext {
    userId?: string;
    courseId?: string;
    paymentId?: string;
    transactionId?: string | number;
    action?: string;
    metadata?: Record<string, any>;
  }
  
  export class Logger {
    private static formatMessage(level: string, message: string, context?: LogContext): string {
      const timestamp = new Date().toISOString();
      const contextStr = context ? JSON.stringify(context) : '';
      return `[${timestamp}] ${level.toUpperCase()}: ${message} ${contextStr}`;
    }
  
    static info(message: string, context?: LogContext): void {
      console.log(this.formatMessage('info', message, context));
    }
  
    static warn(message: string, context?: LogContext): void {
      console.warn(this.formatMessage('warn', message, context));
    }
  
    static error(message: string, error?: Error, context?: LogContext): void {
      const errorContext = {
        ...context,
        error: error?.message,
        stack: error?.stack,
      };
      console.error(this.formatMessage('error', message, errorContext));
    }
  
    static payment(message: string, context: LogContext): void {
      this.info(`[PAYMENT] ${message}`, context);
    }
  
    static enrollment(message: string, context: LogContext): void {
      this.info(`[ENROLLMENT] ${message}`, context);
    }
  
    static webhook(message: string, context: LogContext): void {
      this.info(`[WEBHOOK] ${message}`, context);
    }
  
    static security(message: string, context?: LogContext): void {
      this.warn(`[SECURITY] ${message}`, context);
    }
  }
  