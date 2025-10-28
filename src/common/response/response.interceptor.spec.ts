import { ResponseInterceptor } from './response.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';

describe('ResponseInterceptor', () => {
  it('should be defined', () => {
    expect(new ResponseInterceptor()).toBeDefined();
  });

  it('should set headers, status, and send data', (done) => {
    const mockReply = {
      header: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const mockHttpContext = {
      getResponse: jest.fn().mockReturnValue(mockReply),
      getRequest: jest.fn(),
    };

    const mockContext: Partial<ExecutionContext> = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
    };

    const data = { status: 200, foo: 'bar' };
    const mockCallHandler: Partial<CallHandler> = {
      handle: () => of(data),
    };

    const interceptor = new ResponseInterceptor();

    interceptor
      .intercept(
        mockContext as ExecutionContext,
        mockCallHandler as CallHandler,
      )
      .subscribe(() => {
        expect(mockReply.header).toHaveBeenCalledWith('X-API-Version', '1.0.0');
        expect(mockReply.header).toHaveBeenCalledWith(
          'X-Response-Time',
          expect.stringMatching(/^\d+ms$/),
        );
        expect(mockReply.status).toHaveBeenCalledWith(200);
        expect(mockReply.send).toHaveBeenCalledWith(data);
        done();
      });
  });
});
