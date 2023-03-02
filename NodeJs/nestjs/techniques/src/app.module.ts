import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
// import { User } from './user/entities/user.entity';
import { UserPhotoModule } from './user-photo/user-photo.module';
import configuration from 'config/configuration';
import auth from 'config/auth';
// import { UserPhoto } from './user-photo/entities/user-photo.entity';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, auth],
    }),
    ScheduleModule.forRoot(),
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info) => {
          return `${info.level} ${info.timestamp} ${info.message}`;
        }),
      ),
      // options
      transports: [
        new DailyRotateFile({
          // filename: 'logs/error-%DATE%.log',
          filename: path.join(process.cwd(), 'logs', 'error-%DATE%.log'),
          // datePattern: 'YYYY-MM-DD-HH',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error',
        }),
        new DailyRotateFile({
          filename: path.join(process.cwd(), 'logs', 'info-%DATE%.log'),
          // 按天存放
          datePattern: 'YYYY-MM-DD',
          // 按小时来
          // datePattern: 'YYYY-MM-DD-HH',
          // 自动压缩
          zippedArchive: true,
          handleExceptions: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'info',
        }),
        new winston.transports.Console({ level: 'error' }),
        // new winston.transports.File({ filename: 'error.log', level: 'error' }),
        // new winston.transports.File({ filename: 'combined.log' }),
      ],
    }),
    // 连接数据库
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'Aa@1234',
      database: 'nest-test',
      // entities: [User, UserPhoto],
      autoLoadEntities: true,
      synchronize: true,
    }),
    UserModule,
    UserPhotoModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
