import { Module } from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import { ProductVariantsController } from './product-variants.controller';
import { DatabaseService } from '../database.service';

@Module({
  controllers: [ProductVariantsController],
  providers: [ProductVariantsService, DatabaseService],
})
export class ProductVariantsModule {}
