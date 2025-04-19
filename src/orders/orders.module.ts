import { Module } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, DatabaseService],
})
export class OrdersModule {}