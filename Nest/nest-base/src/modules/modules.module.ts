import { Global, Module } from '@nestjs/common';
import { ModulesService } from './modules.service';

@Module({
  imports: [], // 导入其他模块
  providers: [ModulesService], // 注入提供者
  exports: [ModulesService], // 必须导出才能在其他模块中使用
})
@Global() // 声明为全局模块，在其他模块使用的时候不必导入
export class ModulesModule {}
