import { BeforeApplicationShutdown, Module, OnApplicationBootstrap, OnApplicationShutdown, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@Module({})
export class AppModule
  implements
    OnModuleInit,
    OnApplicationBootstrap,
    OnModuleDestroy,
    BeforeApplicationShutdown,
    OnApplicationShutdown
{
  onModuleInit() {
    console.log('onModuleInit');
  }

  onApplicationBootstrap() {
    console.log('onApplicationBootstrap');
  }

  onModuleDestroy() {
    console.log('onModuleDestroy');
  }

  beforeApplicationShutdown(signal?: string) {
    console.log('beforeApplicationShutdown', signal);
  }

  onApplicationShutdown(signal?: string) {
    console.log('onApplicationShutdown', signal);
  }
}
