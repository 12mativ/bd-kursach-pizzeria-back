import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { DatabaseService } from 'src/database.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService, DatabaseService],
})
export class TasksModule {}
