import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { CreatePizzaDto } from './dto/create-pizza.dto';
import { UpdatePizzaDto } from './dto/update-pizza.dto';
import * as fs from 'fs';
import * as path from 'path';

export interface Pizza {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

@Injectable()
export class PizzaService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'pizzas');

  constructor(private readonly dbService: DatabaseService) {
    // Создаем директорию для загрузки, если она не существует
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadImage(id: number, file: Express.Multer.File): Promise<Pizza> {
    const fileName = `${id}-${Date.now()}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadDir, fileName);
    
    // Сохраняем файл
    fs.writeFileSync(filePath, file.buffer);
    
    // Обновляем путь к изображению в базе данных
    const imageUrl = `/uploads/pizzas/${fileName}`;
    return this.dbService.updateAndReturn<Pizza>('Pizza', id, { imageUrl });
  }

  async create(createPizzaDto: CreatePizzaDto): Promise<Pizza> {
    return this.dbService.insertAndReturn<Pizza>('Pizza', createPizzaDto);
  }

  async findAll(): Promise<Pizza[]> {
    const [pizzas] = await this.dbService.connection.query('SELECT * FROM Pizza');
    return pizzas as Pizza[];
  }

  async findOne(id: number): Promise<Pizza> {
    const [pizzas] = await this.dbService.connection.query(
      'SELECT * FROM Pizza WHERE id = ?',
      [id],
    );
    return pizzas[0];
  }

  async update(id: number, updatePizzaDto: UpdatePizzaDto): Promise<Pizza> {
    return this.dbService.updateAndReturn<Pizza>('Pizza', id, updatePizzaDto);
  }

  async remove(id: number): Promise<Pizza | null> {
    return this.dbService.deleteAndReturn<Pizza>('Pizza', id);
  }
} 