import { Module } from '@nestjs/common';
import { WorkplacesService } from './workplaces.service';
import { WorkplacesController } from './workplaces.controller';
import { DatabaseService } from 'src/database.service';

@Module({
  controllers: [WorkplacesController],
  providers: [WorkplacesService, DatabaseService],
})
export class WorkplacesModule {}
