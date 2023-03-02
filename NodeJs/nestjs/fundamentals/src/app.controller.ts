import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from './config/config.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Inject('useValue')
  private readonly useValue: any;

  @Inject('useFactory') private readonly useFactory: any;

  @Get()
  getHello() {
    return {
      appService: this.appService.getHello(),
      useValue: this.useValue.main,
      useFactory: this.useFactory.main,
      configService: this.configService.get('NAME'),
    };
  }
}
