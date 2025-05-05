import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Order, OrderWithProducts } from './entities/order.entity';

@ApiTags('Заказы')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('ADMIN', 'CLIENT')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Создать новый заказ' })
  @ApiResponse({ 
    status: 201, 
    description: 'Заказ успешно создан',
    type: Order
  })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  // @Get()
  // @ApiOperation({ summary: 'Получить все заказы' })
  // @ApiResponse({ 
  //   status: 200, 
  //   description: 'Список всех заказов',
  //   type: [Order]
  // })
  // findAll() {
  //   return this.ordersService.findAll();
  // }

  @Get('')
  @ApiOperation({ summary: 'Получить все заказы клиента' })
  @ApiResponse({ 
    status: 200, 
    description: 'Список всех заказов',
    type: [OrderWithProducts]
  })
  findByClient(@Query('clientId') id: string) {
    return this.ordersService.findByClientId(+id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить заказ по ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Заказ найден',
    type: Order
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Заказ не найден'
  })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER', 'CASHIER')
  @ApiOperation({ summary: 'Обновить заказ' })
  @ApiResponse({ 
    status: 200, 
    description: 'Заказ успешно обновлен',
    type: Order
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Заказ не найден'
  })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Удалить заказ' })
  @ApiResponse({ 
    status: 200, 
    description: 'Заказ успешно удален',
    type: Order
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Заказ не найден'
  })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
