import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseService } from './database.service';
import { EmployeesModule } from './employees/employees.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { WorkplacesModule } from './workplaces/workplaces.module';
import { ProductVariantsModule } from './product-variants/product-variants.module';
import { EmployeeSchedulesModule } from './employee-schedules/employee-schedules.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EmployeesModule, 
    WorkplacesModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    ProductVariantsModule,
    EmployeeSchedulesModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
