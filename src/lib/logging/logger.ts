import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  // Temporarily disable pino-pretty to avoid thread-stream issues
  transport: undefined,
});

export function withRequest(requestId: string, userId?: string | null) {
  return logger.child({ requestId, userId });
}

