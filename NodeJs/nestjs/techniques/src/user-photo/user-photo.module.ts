import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPhotoService } from './user-photo.service';
import { UserPhotoController } from './user-photo.controller';
import { UserPhoto } from './entities/user-photo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPhoto])],
  controllers: [UserPhotoController],
  providers: [UserPhotoService],
})
export class UserPhotoModule {}
