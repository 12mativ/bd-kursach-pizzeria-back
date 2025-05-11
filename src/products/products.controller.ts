import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Продукты')
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Создать новый продукт' })
  @ApiResponse({ status: 201, description: 'Продукт успешно создана' })
  @Post()
  async reate(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const product = await this.productsService.create(createProductDto);
    if (file) {
      return this.productsService.uploadImage(product.id, file);
    }
    return [product];
  }

  @Get('/pizzas')
  findAllPizzas() {
    return this.productsService.findAllPizzas();
  }

  @Get('/drinks')
  findAllDrinks() {
    return this.productsService.findAllDrinks();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Обновить информацию о продукте' })
  @ApiResponse({ status: 200, description: 'Продукт успешно обновлена' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const product = await this.productsService.update(+id, updateProductDto);
    if (file) {
      return this.productsService.uploadImage(product.id, file);
    }
    return product;
  }

  @Patch('/available/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Обновить доступность продукта' })
  @ApiResponse({ status: 200, description: 'Продукт успешно обновлен' })
  async updateAvailability(
    @Param('id') id: string,
    @Body() {availability}: {availability: boolean},

  ) {
    const product = await this.productsService.makeAvailable(+id, availability);
    return product;
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Удалить продукт' })
  @ApiResponse({ 
    status: 200, 
    description: 'Продукт успешно удален',
    type: Object
  })
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
