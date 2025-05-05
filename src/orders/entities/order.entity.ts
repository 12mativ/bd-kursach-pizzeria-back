import { ApiProperty } from '@nestjs/swagger';

export enum OrderStatus {
  PREPARING = 'preparing',
  READY = 'ready',
}

export class Order {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор заказа' })
  id: number;

  @ApiProperty({ example: '2023-01-01T12:00:00Z', description: 'Дата и время заказа' })
  orderDate: Date;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PREPARING, description: 'Статус заказа' })
  status: OrderStatus;

  @ApiProperty({ example: 1250.50, description: 'Общая сумма заказа' })
  totalAmount: number;
}

export class OrderItem {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор элемента заказа' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID заказа' })
  order_id: number;

  @ApiProperty({ example: 1, description: 'ID продукта' })
  product_id: number;

  @ApiProperty({ example: 1, description: 'ID варианта продукта (опционально)', required: false })
  variant_id?: number;

  @ApiProperty({ example: 2, description: 'Количество' })
  quantity: number;
}

export class OrderProductDto {
  @ApiProperty({ example: 1, description: 'ID продукта' })
  id: number;

  @ApiProperty({ example: 'Пепперони', description: 'Название продукта' })
  name: string;

  @ApiProperty({ example: 400.00, description: 'Цена продукта с учетом варианта', type: 'number' })
  price: number;

  @ApiProperty({ example: 'small', description: 'Название варианта продукта' })
  variant_name: string;

  @ApiProperty({ example: 2, description: 'Количество продукта в заказе' })
  quantity: number;
}

export class OrderWithProducts {
  @ApiProperty({ example: 1, description: 'ID заказа' })
  id: number;

  @ApiProperty({ example: '2023-01-01T12:00:00Z', description: 'Дата и время заказа' })
  orderDate: string;

  @ApiProperty({ example: 'preparing', description: 'Статус заказа', enum: ['preparing', 'ready'] })
  status: string;

  @ApiProperty({ example: 1250.50, description: 'Общая сумма заказа', type: 'number' })
  totalAmount: number;

  @ApiProperty({ 
    type: [OrderProductDto],
    description: 'Список продуктов в заказе'
  })
  products: OrderProductDto[];
}