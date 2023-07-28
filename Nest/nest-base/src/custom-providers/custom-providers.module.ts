import { Injectable, Module } from '@nestjs/common';
import { CustomProvidersService } from './custom-providers.service';

export class useClass {
  constructor(public num = 1) {}
}

@Injectable()
export class useExistingInjectable {
  public name = 'lian';
}

@Module({
  // 提供者，声明后续需要注入的依赖
  providers: [
    CustomProvidersService,
    // 值提供者
    {
      provide: 'useValue', // provide 提供一个令牌，可以是字符串或类，只要注入的时候是同一个字符串或类。
      useValue: 'useValue',
    },
    // 类提供者，使用 useClass 会自动实例化
    {
      provide: 'useClass',
      useClass: useClass,
    },
    // 工厂提供者，是提供异步值的唯一方式
    {
      provide: 'useFactory',
      async useFactory(a: useClass) {
        const value = await new Promise((resolve) => {
          setTimeout(() => {
            resolve('useFactory');
          }, 1000);
        });
        return {
          num: a.num,
          useFactory: value,
        };
      },
      inject: ['useClass'], // 注入其他提供者
    },
    // 别名提供者，为现有的提供者起一个别名
    useExistingInjectable,
    {
      provide: 'useExisting',
      useExisting: useExistingInjectable,
    },
  ],
  // 非全局模块必须导出其他模块才能使用
  exports: ['useValue'],
})
export class CustomProvidersModule {}
