import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { Role } from './entities/role.entity';
import { RoleDept } from './entities/role-dept.entity';
import { Dept } from './entities/dept.entity';
import { AuthGuard } from './auth.guard';
import { DataScopeInterceptor } from './datascope.interceptor';
import { DataScopeService } from './datascope.service';

@Module({
  imports: [
    ClsModule.forRoot({
      middleware: {
        mount: true,
        saveReq: true,
      },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      port: 3306,
      host: 'localhost',
      username: 'root',
      password: 'Aa@123456',
      database: 'test_datascope',
      synchronize: true,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([User, UserRole, Role, RoleDept, Dept]),
  ],
  controllers: [AppController, UserController],
  providers: [
    AppService,
    UserService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DataScopeInterceptor,
    },
    {
      provide: DataScopeService,
      useClass: DataScopeService,
    },
  ],
})
export class AppModule {}
