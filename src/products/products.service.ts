import { Injectable } from '@nestjs/common';
import { CreateProductDto, ProductType } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DatabaseService } from 'src/database.service';
import * as fs from 'fs';
import * as path from 'path';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  productType: ProductType;
}

export interface ProductVariant {
  product_id: number;
  variant_name: string;
  price_modifier: number;
}

@Injectable()
export class ProductsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'pizzas');
  constructor(private readonly dbService: DatabaseService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadImage(id: number, file: Express.Multer.File): Promise<Product> {
    const fileName = `${id}-${Date.now()}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadDir, fileName);

    // Сохраняем файл
    fs.writeFileSync(filePath, file.buffer);

    // Обновляем путь к изображению в базе данных
    const imageUrl = `/uploads/pizzas/${fileName}`;
    return this.dbService.updateAndReturn<Product>('Product', id, { imageUrl });
  }

  async create(createProductDto: CreateProductDto) {
    const newProduct = await this.dbService.insertAndReturn<Product>('Product', createProductDto);
    await this.dbService.insertAndReturn<ProductVariant>('ProductVariant', {product_id: newProduct.id, variant_name: "small", price_modifier: 1});
    await this.dbService.insertAndReturn<ProductVariant>('ProductVariant', {product_id: newProduct.id, variant_name: "medium", price_modifier: 1.5});
    await this.dbService.insertAndReturn<ProductVariant>('ProductVariant', {product_id: newProduct.id, variant_name: "large", price_modifier: 2});

    return newProduct;
  }

  async findAllPizzas() {
    const sql = `SELECT * FROM Product WHERE productType = 'PIZZA'`;
    const [pizzas] = await this.dbService.connection.query(sql);
    return pizzas;
  }

  async findAllDrinks() {
    const sql = `SELECT * FROM Product WHERE productType = 'DRINK'`;
    const [drinks] = await this.dbService.connection.query(sql);
    return drinks;
  }

  async makeAvailable(id: number) {
    return this.dbService.updateAndReturn<Product>('Product', id, {available: true});
  }


  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return this.dbService.updateAndReturn<Product>('Product', id, updateProductDto);
  }

  remove(id: number) {
    return this.dbService.deleteAndReturn<Product>('Product', id);
  }
}
