import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderItemDto {
  @ApiProperty({ example: 1, description: 'ID продукта' })
  @IsNumber()
  @IsNotEmpty()
  product_id: number;

  @ApiProperty({ example: "small", description: 'Название варианта продукта' })
  @IsString()
  variant_name?: string;

  @ApiProperty({ example: 2, description: 'Количество' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ 
    type: [CreateOrderItemDto], 
    description: 'Элементы заказа' 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({ 
    enum: OrderStatus, 
    default: OrderStatus.PREPARING,
    description: 'Статус заказа' 
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus = OrderStatus.PREPARING;

  @ApiProperty({ example: 1, description: 'ID клиента', required: true })
  @IsNumber()
  clientId: number;
}
