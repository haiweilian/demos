import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get()
  getHello() {
    this.logger.info('This is info log');
    this.logger.error('This is error log');
    this.logger.silly('This is silly log');
    return {
      appService: this.appService.getHello(),
      configService: {
        DATABASE_USER: this.configService.get('DATABASE_USER'),
        DATABASE_PASSWORD: this.configService.get('DATABASE_PASSWORD'),
        port: this.configService.get('port'),
        role: this.configService.get('role'),
        'database.host': this.configService.get('database.host'),
        'database.port': this.configService.get('database.port'),
        env: process.env,
      },
    };
  }
}
