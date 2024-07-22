import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheckService(): string {
    return 'Hello World!';
  }
}
