import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  // MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { storage } from './storage';
import { MyMaxFileSizeValidator } from './MyMaxFileSizeValidator';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 单文件上传
  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
    }),
  )
  upload(
    @UploadedFile(
      // 文件验证
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({ maxSize: 1024 * 100 }),
          new MyMaxFileSizeValidator({ maxSize: 1024 * 100 }),
          new FileTypeValidator({ fileType: 'image/png' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body,
  ) {
    console.log(file, body);
    return {
      path: file.filename,
    };
  }

  // 多文件上传
  @Post('/uploads')
  @UseInterceptors(
    FilesInterceptor('file', 10, {
      dest: 'uploads',
    }),
  )
  uploads(@UploadedFiles() file: Array<Express.Multer.File>, @Body() body) {
    console.log(file, body);
  }

  // 下载文件
  @Get('/download')
  download(
    @Query('url') url: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = createReadStream(join(__dirname, '../uploads', url));
    // 指定名称可以在利用浏览器下载功能时为指定的文件名
    res.set({
      'Content-Disposition': `attachment; filename="${url}"`,
    });
    return new StreamableFile(file);
  }
}
