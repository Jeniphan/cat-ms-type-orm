import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './helper/http-exception.filter';
import { ApplicationGuard } from './application/application.guard';

async function bootstrap() {
  const port = process.env.PORT;

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      cors: true,
    },
  );

  await app.register(import('@fastify/rate-limit'), {
    max: 100,
    timeWindow: '1 minute',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalGuards(new ApplicationGuard());

  const config = new DocumentBuilder()
    .setTitle('NestJS Template Microservice')
    .setDescription(
      'This NestJS Template Microservice use TypeORM, Fastify, Swagger, JWT',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('default')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port, '0.0.0.0');
  const logger = new Logger();
  logger.log(`🚀LISTEN ON PORT : ${port} 🚀`);
  logger.log(`📚 ${await app.getUrl()}/docs`);
}

bootstrap();
