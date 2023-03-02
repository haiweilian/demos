import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import { connection } from './cats/connection';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    CatsModule,
    ConfigModule.register({
      folder: './config',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 值提供者
    {
      provide: 'useValue',
      useValue: connection, // 动态的可以做任何逻辑
    },
    // 工厂提供者
    {
      provide: 'useFactory',
      useFactory: () => connection, // 动态的可以做任何逻辑
    },
  ],
})
export class AppModule {}
