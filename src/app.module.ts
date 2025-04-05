import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './database.service';
import { EmployeesModule } from './employees/employees.module';
import { WorkplacesModule } from './workplaces/workplaces.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [EmployeesModule, WorkplacesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
