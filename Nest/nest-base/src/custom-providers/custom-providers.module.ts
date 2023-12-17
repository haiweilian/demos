import { Module } from '@nestjs/common';
import { CustomProvidersController } from './custom-providers.controller';
import { CustomProvidersService } from './custom-providers.service';
import { ConfigValue, ConfigFactory, ConfigExisting } from './token';

@Module({
  controllers: [CustomProvidersController],
  providers: [
    // 标准提供者，
    // CustomProvidersService, // 等同类提供者的简写
    {
      provide: CustomProvidersService,
      useClass: CustomProvidersService,
    },

    // 值提供者，可以注入任意的常量和对象
    {
      provide: 'configValue',
      useValue: { name: 'lian' },
    },
    {
      provide: ConfigValue,
      useValue: new ConfigValue(),
    },

    // 工厂提供者，提供一个函数可以是同步或异步
    {
      provide: 'configFactory',
      async useFactory(config) {
        return Promise.resolve({
          name: config.name,
          address: 'China',
        });
      },
      inject: ['configValue'], // 依赖项
    },
    {
      provide: ConfigFactory,
      async useFactory(config) {
        return Promise.resolve({
          name: config.name,
          address: 'China',
        });
      },
      inject: [ConfigValue], // 依赖项
    },

    // 别名提供者，可以对另一个提供者起一个别名
    {
      provide: 'configExisting',
      useExisting: 'configFactory',
    },
    {
      provide: ConfigExisting,
      useExisting: ConfigFactory,
    },
  ],
})
export class CustomProvidersModule {}
