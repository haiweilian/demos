import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArchiverController } from './archiver.controller';

@Module({
  imports: [],
  controllers: [AppController, ArchiverController],
  providers: [AppService],
})
export class AppModule {}
