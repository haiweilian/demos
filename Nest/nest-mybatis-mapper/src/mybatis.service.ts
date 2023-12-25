import { Injectable, OnModuleInit } from '@nestjs/common';
import * as glob from 'fast-glob';
import * as chokidar from 'chokidar';
import * as mybatisMapper from 'mybatis-mapper';

@Injectable()
export class MybatisService implements OnModuleInit {
  onModuleInit() {
    this.loadMapper();
    this.watchMapper();
  }

  /**
   * 获取 SQL 语句
   */
  getSql(namespace: string, sql: string, param?: any) {
    return mybatisMapper.getStatement(namespace, sql, param);
  }

  /**
   * 加载 Mapper 文件
   */
  private loadMapper() {
    const files = glob.globSync('**/*.mapper.xml', {
      cwd: __dirname,
      absolute: true,
    });
    mybatisMapper.createMapper(files);
  }

  /**
   * 监听 Mapper 文件
   */
  private watchMapper() {
    chokidar
      .watch('**/*.mapper.xml', {
        cwd: __dirname,
      })
      .on('all', () => {
        // TODO: 只重新加载变化的
        this.loadMapper();
      });
  }
}
