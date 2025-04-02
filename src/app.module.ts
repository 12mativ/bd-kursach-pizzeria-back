import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './database.service';
import { TasksModule } from './tasks/tasks.module';
import { EmployeesModule } from './employees/employees.module';
import { WorkplacesModule } from './workplaces/workplaces.module';

@Module({
  imports: [TasksModule, EmployeesModule, WorkplacesModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
