import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  @Cron('20 * * * * *')
  handleCron() {
    this.logger.debug('Called when the current second is 45');
  }
}
