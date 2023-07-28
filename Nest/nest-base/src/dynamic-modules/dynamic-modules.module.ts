import { DynamicModule, Module } from '@nestjs/common';
import { DynamicModulesService } from './dynamic-modules.service';
import { DynamicModulesController } from './dynamic-modules.controller';

@Module({})
export class DynamicModulesModule {
  // 返回一个动态的模块
  // 动态模块的作用就是可以传入参数
  static forRoot(options): DynamicModule {
    console.log('【dynamic-modules】', options);
    return {
      module: DynamicModulesModule,
      controllers: [DynamicModulesController],
      providers: [DynamicModulesService],
    };
  }
}
