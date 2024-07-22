import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { EntityProviders } from '@entities/entity.providers';
import { BaseService } from '@services/base_service/base_service.service';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
  controllers: [AppController],
  providers: [...EntityProviders, AppService, BaseService],
})
export class AppModule {}
