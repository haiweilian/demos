import { Module } from '@nestjs/common';
import { MyLibraryService } from './my-library.service';

@Module({
  providers: [MyLibraryService],
  exports: [MyLibraryService],
})
export class MyLibraryModule {}
