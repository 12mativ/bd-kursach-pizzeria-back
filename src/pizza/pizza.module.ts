import { Module } from '@nestjs/common';
import { PizzaService } from './pizza.service';
import { PizzaController } from './pizza.controller';
import { DatabaseService } from 'src/database.service';

@Module({
  controllers: [PizzaController],
  providers: [PizzaService, DatabaseService],
  exports: [PizzaService]
})
export class PizzaModule {} 