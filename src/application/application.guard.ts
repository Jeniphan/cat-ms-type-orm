import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { HttpClientService, MessageResultAPI } from '@lib/http_client.service';
import * as process from 'node:process';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ApplicationGuard implements CanActivate {
  private readonly httpClient: HttpClientService;
  private readonly jwtService: JwtService;
  constructor() {
    this.httpClient = new HttpClientService();
    this.jwtService = new JwtService();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token = this.extractTokenFromHeader(request);
    if (process.env.NODE_ENV === 'develop') {
      token = await this.jwtService.signAsync(
        {
          applicationName: 'Login Service Dev',
          id: 1,
          key: 'NxHGrZGn+rVw5GbDyQg+Ik1dcbjwEXCPyKHxJdbFcBA=',
        },
        {
          secret: process.env.SECRET_KEY_APPLICATION ?? '',
        },
      );
    }

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      const verifyToken: MessageResultAPI<string> =
        await this.httpClient.CallApi({
          baseURL: process.env.ENDPOINT_APPLICATION_MS,
          method: process.env.METHOD_APPLICATION_VERIFY,
          url: process.env.URL_APPLICATION_VERIFY,
          data: {
            token: token,
          },
        });

      if (!verifyToken || verifyToken.status !== 200) {
        this.handleError('Verify Token have error!!');
      }
      request.headers['app_id'] = verifyToken.result;
      return true;
    } catch (err) {
      this.handleError(err);
    }
  }

  private extractTokenFromHeader(request: FastifyRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private handleError(message?: string) {
    throw new UnauthorizedException({
      message: message,
    });
  }
}
