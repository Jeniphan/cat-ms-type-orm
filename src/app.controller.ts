import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { FastifyReply } from 'fastify';
import ApiResponse from './lib/http-response';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health-check')
  healthCheck(@Res() res: FastifyReply) {
    try {
      const result = this.appService.healthCheckService();
      return new ApiResponse(res).handle(result);
    } catch (err) {
      return new ApiResponse(res).error(err);
    }
  }
}
