import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { DatabaseService } from 'src/database.service';
import {
  Order,
  OrderItem,
  OrderStatus,
  OrderWithProducts,
  OrderProductDto,
} from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const connection = this.dbService.getConnection();
    await connection.beginTransaction();
    
    try {
      let totalAmount = 0;
      const productPrices = new Map<number, number>();
      const variantModifiers = new Map<number, number>();

      // Получаем цены всех продуктов одним запросом
      const productIds = createOrderDto.items.map(item => item.product_id);
      if (productIds.length > 0) {
        const [productRows]: any = await connection.query(
          'SELECT id, price FROM Product WHERE id IN (?)',
          [productIds]
        );
        
        productRows.forEach((product: any) => {
          productPrices.set(product.id, product.price);
        });
      }

      // Получаем модификаторы вариантов
      const variantQueries = createOrderDto.items
        .filter(item => item.variant_name)
        .map(item => connection.query(
          'SELECT id, price_modifier FROM ProductVariant WHERE product_id = ? AND variant_name = ?',
          [item.product_id, item.variant_name]
        ));

      const variantResults = await Promise.all(variantQueries);
      variantResults.forEach(([rows]: any) => {
        if (rows && rows.length > 0) {
          variantModifiers.set(rows[0].id, rows[0].price_modifier);
        }
      });

      // Рассчитываем общую сумму
      for (const item of createOrderDto.items) {
        const productPrice = productPrices.get(item.product_id);
        if (productPrice === undefined) {
          throw new NotFoundException(`Product with ID ${item.product_id} not found`);
        }

        let itemPrice = productPrice;
        if (item.variant_name) {
          const variantId = variantResults.find(
            ([rows]: any) => rows && rows.length > 0 && rows[0].product_id === item.product_id
          )?.[0]?.[0]?.id;
          
          if (variantId) {
            const modifier = variantModifiers.get(variantId) || 0;
            itemPrice += modifier;
          }
        }

        totalAmount += itemPrice * item.quantity;
      }

      // Создаем заказ
      const orderData = {
        orderDate: new Date(),
        status: createOrderDto.status || OrderStatus.PREPARING,
        totalAmount,
      };

      const [orderResult] = await connection.query(
        'INSERT INTO ProductOrder SET ?',
        [orderData]
      );
      
      const orderId = (orderResult as any).insertId;

      // Связываем клиента с заказом
      await connection.query(
        'INSERT INTO ClientProductOrder (client_id, product_order_id) VALUES (?, ?)',
        [createOrderDto.clientId, orderId]
      );

      // Добавляем элементы заказа
      const itemPromises = createOrderDto.items.map(async (item) => {
        let variantId = null;
        if (item.variant_name) {
          const [variantRows]: any = await connection.query(
            'SELECT id FROM ProductVariant WHERE product_id = ? AND variant_name = ?',
            [item.product_id, item.variant_name]
          );
          variantId = variantRows[0]?.id || null;
        }

        await connection.query(
          'INSERT INTO ProductOrderItem (order_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, variantId, item.quantity]
        );
      });

      await Promise.all(itemPromises);
      await connection.commit();

      return { id: orderId, ...orderData };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  async findAll(): Promise<Order[]> {
    const [rows]: any = await this.dbService.connection.query(
      'SELECT * FROM ProductOrder ORDER BY orderDate DESC'
    );
    return rows.map((row: any) => ({
      ...row,
      orderDate: new Date(row.orderDate),
    }));
  }

  async findByClientId(clientId: number): Promise<OrderWithProducts[]> {
    if (isNaN(clientId)) {
      throw new Error('Invalid client ID');
    }

    try {
      // 1. Получаем заказы клиента
      const [orders]: any = await this.dbService.connection.query(
        `SELECT po.* FROM ProductOrder po
         JOIN ClientProductOrder cpo ON po.id = cpo.product_order_id
         WHERE cpo.client_id = ? ORDER BY po.orderDate DESC`,
        [clientId]
      );

      if (!orders || orders.length === 0) {
        return [];
      }

      // 2. Получаем товары для заказов
      const orderIds = orders.map((o: any) => o.id);
      const [allProducts]: any = await this.dbService.connection.query(
        `SELECT 
           poi.order_id,
           p.id,
           p.name,
           (p.price * IFNULL(pv.price_modifier, 0)) AS price,
           IFNULL(pv.variant_name, 'standard') AS variant_name,
           poi.quantity
         FROM ProductOrderItem poi
         LEFT JOIN Product p ON poi.product_id = p.id
         LEFT JOIN ProductVariant pv ON poi.variant_id = pv.id
         WHERE poi.order_id IN (?)`,
        [orderIds]
      );

      // 3. Группируем товары
      const productsByOrderId = allProducts.reduce((acc: Record<number, OrderProductDto[]>, product: any) => {
        if (!acc[product.order_id]) {
          acc[product.order_id] = [];
        }
        acc[product.order_id].push({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          variant_name: product.variant_name,
          quantity: product.quantity,
        });
        return acc;
      }, {});

      // 4. Формируем результат
      return orders.map((order: any) => ({
        id: order.id,
        orderDate: order.orderDate.toISOString(),
        status: order.status,
        totalAmount: order.totalAmount,
        products: productsByOrderId[order.id] || [],
      }));
    } catch (error) {
      console.error('Error in findByClientId:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  async findOne(id: number): Promise<{ order: Order; items: OrderItem[] }> {
    const [orderRows]: any = await this.dbService.connection.query(
      'SELECT * FROM ProductOrder WHERE id = ?',
      [id]
    );

    if (!orderRows || orderRows.length === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const order = {
      ...orderRows[0],
      orderDate: new Date(orderRows[0].orderDate),
    };

    const [itemRows]: any = await this.dbService.connection.query(
      `SELECT 
         poi.*,
         p.name as product_name,
         pv.variant_name
       FROM ProductOrderItem poi
       LEFT JOIN Product p ON poi.product_id = p.id
       LEFT JOIN ProductVariant pv ON poi.variant_id = pv.id
       WHERE poi.order_id = ?`,
      [id]
    );

    return {
      order,
      items: itemRows.map((row: any) => ({
        id: row.id,
        order_id: row.order_id,
        product_id: row.product_id,
        variant_id: row.variant_id,
        quantity: row.quantity,
        product_name: row.product_name,
        variant_name: row.variant_name,
      })),
    };
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const connection = this.dbService.getConnection();
    await connection.beginTransaction();

    try {
      // Проверяем существование заказа
      const [orderRows]: any = await connection.query(
        'SELECT * FROM ProductOrder WHERE id = ?',
        [id]
      );

      if (!orderRows || orderRows.length === 0) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // Обновляем статус если нужно
      if (updateOrderDto.status) {
        await connection.query(
          'UPDATE ProductOrder SET status = ? WHERE id = ?',
          [updateOrderDto.status, id]
        );
      }

      // Обновляем товары если нужно
      if (updateOrderDto.items && updateOrderDto.items.length > 0) {
        // Удаляем старые товары
        await connection.query(
          'DELETE FROM ProductOrderItem WHERE order_id = ?',
          [id]
        );

        // Рассчитываем новую сумму
        let totalAmount = 0;
        const productIds = updateOrderDto.items.map(item => item.product_id);
        const productPrices = new Map<number, number>();

        if (productIds.length > 0) {
          const [productRows]: any = await connection.query(
            'SELECT id, price FROM Product WHERE id IN (?)',
            [productIds]
          );

          productRows.forEach((product: any) => {
            productPrices.set(product.id, product.price);
          });
        }

        // Добавляем новые товары
        for (const item of updateOrderDto.items) {
          const productPrice = productPrices.get(item.product_id);
          if (productPrice === undefined) {
            throw new NotFoundException(`Product with ID ${item.product_id} not found`);
          }

          let variantId = null;
          let variantModifier = 0;

          if (item.variant_name) {
            const [variantRows]: any = await connection.query(
              'SELECT id, price_modifier FROM ProductVariant WHERE product_id = ? AND variant_name = ?',
              [item.product_id, item.variant_name]
            );

            if (variantRows && variantRows.length > 0) {
              variantId = variantRows[0].id;
              variantModifier = variantRows[0].price_modifier;
            }
          }

          const itemPrice = productPrice + variantModifier;
          totalAmount += itemPrice * item.quantity;

          await connection.query(
            'INSERT INTO ProductOrderItem (order_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
            [id, item.product_id, variantId, item.quantity]
          );
        }

        // Обновляем общую сумму
        await connection.query(
          'UPDATE ProductOrder SET totalAmount = ? WHERE id = ?',
          [totalAmount, id]
        );
      }

      await connection.commit();

      // Возвращаем обновленный заказ
      const [updatedOrder]: any = await connection.query(
        'SELECT * FROM ProductOrder WHERE id = ?',
        [id]
      );

      return {
        ...updatedOrder[0],
        orderDate: new Date(updatedOrder[0].orderDate),
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  async remove(id: number): Promise<Order> {
    const connection = this.dbService.getConnection();
    await connection.beginTransaction();

    try {
      const [orderRows]: any = await connection.query(
        'SELECT * FROM ProductOrder WHERE id = ?',
        [id]
      );

      if (!orderRows || orderRows.length === 0) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      const order = {
        ...orderRows[0],
        orderDate: new Date(orderRows[0].orderDate),
      };

      // Удаляем связь с клиентом
      await connection.query(
        'DELETE FROM ClientProductOrder WHERE product_order_id = ?',
        [id]
      );

      // Удаляем элементы заказа
      await connection.query(
        'DELETE FROM ProductOrderItem WHERE order_id = ?',
        [id]
      );

      // Удаляем сам заказ
      await connection.query(
        'DELETE FROM ProductOrder WHERE id = ?',
        [id]
      );

      await connection.commit();
      return order;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }
}