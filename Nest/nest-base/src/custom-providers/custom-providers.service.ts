import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class CustomProvidersService implements OnModuleInit {
  constructor(
    @Inject('useValue') private useValue: any,
    @Inject('useClass') private useClass: any,
    @Inject('useFactory') private useFactory: any,
    @Inject('useExisting') private useExisting: any,
  ) {}

  onModuleInit() {
    console.log('【custom-providers】值提供者', this.useValue);
    console.log('【custom-providers】类提供者', this.useClass);
    console.log('【custom-providers】工厂提供者', this.useFactory);
    console.log('【custom-providers】别名提供者', this.useExisting);
  }
}
