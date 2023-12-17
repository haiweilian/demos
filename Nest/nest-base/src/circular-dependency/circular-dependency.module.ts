import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AService } from './a.service';
import { BService } from './b.service';

@Module({
  providers: [AService, BService],
})
export class CircularDependencyModule {}
