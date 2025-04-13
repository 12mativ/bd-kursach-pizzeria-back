import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PizzaService } from './pizza.service';
import { CreatePizzaDto } from './dto/create-pizza.dto';
import { UpdatePizzaDto } from './dto/update-pizza.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@ApiTags('Пиццы')
@Controller('pizza')
@UseGuards(JwtAuthGuard)
export class PizzaController {
  constructor(private readonly pizzaService: PizzaService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Создать новую пиццу' })
  @ApiResponse({ status: 201, description: 'Пицца успешно создана' })
  async create(
    @Body() createPizzaDto: CreatePizzaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const pizza = await this.pizzaService.create(createPizzaDto);
    if (file) {
      return this.pizzaService.uploadImage(pizza.id, file);
    }
    return pizza;
  }

  @Post(':id/image')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.pizzaService.uploadImage(+id, file);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех пицц' })
  @ApiResponse({ 
    status: 200, 
    description: 'Список пицц',
    type: [Object]
  })
  findAll() {
    return this.pizzaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пиццу по ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Информация о пицце',
    type: Object
  })
  findOne(@Param('id') id: string) {
    return this.pizzaService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Обновить информацию о пицце' })
  @ApiResponse({ status: 200, description: 'Пицца успешно обновлена' })
  async update(
    @Param('id') id: string,
    @Body() updatePizzaDto: UpdatePizzaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const pizza = await this.pizzaService.update(+id, updatePizzaDto);
    if (file) {
      return this.pizzaService.uploadImage(pizza.id, file);
    }
    return pizza;
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Удалить пиццу' })
  @ApiResponse({ 
    status: 200, 
    description: 'Пицца успешно удалена',
    type: Object
  })
  remove(@Param('id') id: string) {
    return this.pizzaService.remove(+id);
  }
} 