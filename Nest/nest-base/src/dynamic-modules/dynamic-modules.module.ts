import { DynamicModule, Module } from '@nestjs/common';
import { DynamicModulesController } from './dynamic-modules.controller';

@Module({})
export class DynamicModulesModule {
  static forRoot(config: object): DynamicModule {
    return {
      module: DynamicModulesModule,
      controllers: [DynamicModulesController],
      providers: [
        // 这里把传入的配置注入，就可以在模块中使用
        {
          provide: 'config',
          useValue: config,
        },
      ],
    };
  }
}
