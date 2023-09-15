import { FileValidator } from '@nestjs/common';

export class MyMaxFileSizeValidator extends FileValidator {
  constructor(options: { maxSize: number }) {
    super(options);
  }

  isValid(file?: Express.Multer.File): boolean | Promise<boolean> {
    if (file.size > this.validationOptions.maxSize) {
      return false;
    }
    return true;
  }

  buildErrorMessage(file: Express.Multer.File): string {
    return `文件 ${file.originalname} 大小超出 ${
      this.validationOptions.maxSize / 1024
    }k`;
  }
}
