import { Controller, Get, Res, StreamableFile } from '@nestjs/common';
import * as archiver from 'archiver';
import { Response } from 'express';

// https://www.npmjs.com/package/archiver
// https://docs.nestjs.com/techniques/streaming-files
@Controller('/archiver')
export class ArchiverController {
  /**
   * 实现创建文件内容并返回压缩包
   */
  @Get('/pipe')
  downloadPipe(@Res() res: Response) {
    // 创建压缩文件流
    const archive = archiver('zip');

    // 文件名称
    res.attachment('archiver-pipe.zip');

    // 响应压缩文件流
    archive.pipe(res);

    // 添加文件
    archive.append('文件内容111!', { name: 'aaa/file2.txt' });
    archive.append(Buffer.from('文件内容222!'), { name: 'aaa/file3.txt' });

    // 添加文件完成
    archive.finalize();
  }

  /**
   * 实现创建文件内容并返回压缩包
   */
  @Get('/stream')
  downloadStream(@Res({ passthrough: true }) res: Response) {
    // 创建压缩文件流
    const archive = archiver('zip');

    // 文件名称
    res.attachment('archiver-stream.zip');

    // 添加文件
    archive.append('文件内容111!', { name: 'bbb/file2.txt' });
    archive.append(Buffer.from('文件内容222!'), { name: 'bbb/file3.txt' });

    // 添加文件完成
    archive.finalize();

    // 使用 StreamableFile 类，可以继续使用 Nest 中的拦截等
    return new StreamableFile(archive);
  }
}
