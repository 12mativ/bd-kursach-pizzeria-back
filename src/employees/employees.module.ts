import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { DatabaseService } from '../database.service';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService, DatabaseService],
})
export class EmployeesModule {}
