import { Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

export function loggerMiddleware(
  req: FastifyRequest,
  res: FastifyReply,
  next: () => void,
) {
  const logger = new Logger('HTTP');
  const { method, url, ip } = req;
  logger.log(`${method} ${url} - IP: ${ip}`);
  next();
}
