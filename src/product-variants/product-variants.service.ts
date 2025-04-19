import { Injectable } from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { DatabaseService } from '../database.service';

@Injectable()
export class ProductVariantsService {
  constructor(private readonly dbService: DatabaseService) {}
  
  create(createProductVariantDto: CreateProductVariantDto) {
    
  }

  async findAll() {
    const sql = 'SELECT * FROM ProductVariant;';
    const [employees] = await this.dbService.connection.query(sql);
    return employees;
  }

  findOne(id: number) {
    return `This action returns a #${id} productVariant`;
  }

  update(id: number, updateProductVariantDto: UpdateProductVariantDto) {
    return `This action updates a #${id} productVariant`;
  }

  remove(id: number) {
    return `This action removes a #${id} productVariant`;
  }
}
