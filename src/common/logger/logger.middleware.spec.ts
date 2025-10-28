import { loggerMiddleware } from './logger.middleware';
import { Logger } from '@nestjs/common';

describe('LoggerMiddleware', () => {
  it('should be defined', () => {
    expect(loggerMiddleware).toBeDefined();
  });
});

describe('loggerMiddleware', () => {
  it('should call Logger.log with correct message and call next', () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const req: any = { method: 'GET', url: '/test', ip: '127.0.0.1' };
    const res: any = {};
    const next = jest.fn();

    loggerMiddleware(req, res, next);

    expect(logSpy).toHaveBeenCalledWith('GET /test - IP: 127.0.0.1');
    expect(next).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('should not modify the response object', () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const req: any = { method: 'POST', url: '/api', ip: '192.168.1.1' };
    const res: any = { foo: 'bar' };
    const next = jest.fn();

    loggerMiddleware(req, res, next);

    expect(res).toEqual({ foo: 'bar' });
    expect(next).toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
