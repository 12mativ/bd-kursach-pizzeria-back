import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({ 
    enum: OrderStatus, 
    description: 'Статус заказа',
    required: false
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
