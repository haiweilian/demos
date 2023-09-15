import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FruitsModule } from './fruits/fruits.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'Aa@123456',
      database: 'test',
      entities: [],
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    FruitsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
