import { Module } from '@nestjs/common';
import { CustomController } from './custom.controller';
import { I18nService } from './i18n.service';

@Module({
  controllers: [CustomController],
  providers: [I18nService],
})
export class CustomModule {}
