import { Injectable } from '@nestjs/common';

@Injectable()
export class ExceptionfiltersService {
  private readonly errors: any[] = [];

  add(e: any) {
    this.errors.push(e);
  }

  getAll(): any[] {
    return this.errors;
  }
}
