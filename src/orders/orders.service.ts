import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { DatabaseService } from 'src/database.service';
import { Order, OrderItem, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Start a transaction
    const connection = this.dbService.getConnection();
    await connection.beginTransaction();
    try {
      // Calculate total amount by fetching product prices
      let totalAmount = 0;
      for (const item of createOrderDto.items) {
        // Get product price
        const [productRows]: any = await connection.query(
          'SELECT price FROM Product WHERE id = ?',
          [item.product_id],
        );

        if (!productRows || productRows.length === 0) {
          throw new NotFoundException(
            `Product with ID ${item.product_id} not found`,
          );
        }

        const product = productRows[0];

        // Add price * quantity to total
        totalAmount += product.price * item.quantity;

        // // If variant exists, apply price modifier
        // if (variantId) {
        //   const [variantRows]: any = await connection.query(
        //     'SELECT price_modifier FROM ProductVariant WHERE id = ? AND product_id = ?',
        //     [variantId, item.product_id],
        //   );
        // }
      }

      // Create order
      const orderData = {
        orderDate: new Date(),
        status: createOrderDto.status || OrderStatus.PREPARING,
        totalAmount,
      };

      // Insert order and get the new order
      const order = await this.dbService.insertAndReturn<Order>(
        'ProductOrder',
        orderData,
      );

      await connection.query(`
        INSERT INTO ClientProductOrder (client_id, product_order_id)
        VALUES (${createOrderDto.clientId}, ${order.id});
      `);

      // Insert order items
      for (const item of createOrderDto.items) {
        const [variantId] = await connection.query(
          `SELECT id FROM ProductVariant WHERE product_id = ? AND variant_name = ?`,
          [item.product_id, item.variant_name]
        )

        await connection.query(
          'INSERT INTO ProductOrderItem (order_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
          //@ts-ignore
          [order.id, item.product_id, variantId[0].id || null, item.quantity],
        );
      }

      // Commit transaction
      await connection.commit();

      return order;
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    }
  }

  async findAll(): Promise<Order[]> {
    const [rows]: any = await this.dbService.connection.query(
      'SELECT * FROM ProductOrder ORDER BY orderDate DESC',
    );
    return rows as Order[];
  }

  async findOne(id: number): Promise<{ order: Order; items: OrderItem[] }> {
    // Get order
    const [orderRows]: any = await this.dbService.connection.query(
      'SELECT * FROM ProductOrder WHERE id = ?',
      [id],
    );

    if (!orderRows || orderRows.length === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const order = orderRows[0] as Order;

    // Get order items
    const [itemRows]: any = await this.dbService.connection.query(
      'SELECT * FROM ProductOrderItem WHERE order_id = ?',
      [id],
    );

    return {
      order,
      items: itemRows as OrderItem[],
    };
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    // Check if order exists
    const [orderRows]: any = await this.dbService.connection.query(
      'SELECT * FROM ProductOrder WHERE id = ?',
      [id],
    );

    if (!orderRows || orderRows.length === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Update order status if provided
    if (updateOrderDto.status) {
      await this.dbService.connection.query(
        'UPDATE ProductOrder SET status = ? WHERE id = ?',
        [updateOrderDto.status, id],
      );
    }

    // If items are provided, update them
    if (updateOrderDto.items && updateOrderDto.items.length > 0) {
      const connection = this.dbService.getConnection();
      await connection.beginTransaction();

      try {
        // Delete existing items
        await connection.query(
          'DELETE FROM ProductOrderItem WHERE order_id = ?',
          [id],
        );

        // Calculate new total amount
        let totalAmount = 0;
        for (const item of updateOrderDto.items) {
          // Get product price
          const [productRows]: any = await connection.query(
            'SELECT price FROM Product WHERE id = ?',
            [item.product_id],
          );

          const [variantId] = await connection.query(
            `SELECT id FROM ProductVariant WHERE product_id = ${item.product_id}, variant_name = ${item.variant_name}`
          )

          if (!productRows || productRows.length === 0) {
            throw new NotFoundException(
              `Product with ID ${item.product_id} not found`,
            );
          }

          const product = productRows[0];

          // Add price * quantity to total
          totalAmount += product.price * item.quantity;

          // If variant exists, apply price modifier
          if (variantId) {
            const [variantRows]: any = await connection.query(
              'SELECT price_modifier FROM ProductVariant WHERE id = ? AND product_id = ?',
              //@ts-ignore
              [variantId.id, item.product_id],
            );

            if (variantRows && variantRows.length > 0) {
              totalAmount += variantRows[0].price_modifier * item.quantity;
            }
          }

          // Insert new item
          await connection.query(
            'INSERT INTO ProductOrderItem (order_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
            //@ts-ignore
            [id, item.product_id, variantId.id || null, item.quantity],
          );
        }

        // Update total amount
        await connection.query(
          'UPDATE ProductOrder SET totalAmount = ? WHERE id = ?',
          [totalAmount, id],
        );

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    }

    // Return updated order
    const [updatedOrderRows]: any = await this.dbService.connection.query(
      'SELECT * FROM ProductOrder WHERE id = ?',
      [id],
    );

    return updatedOrderRows[0] as Order;
  }

  async remove(id: number): Promise<Order> {
    // Check if order exists
    const [orderRows]: any = await this.dbService.connection.query(
      'SELECT * FROM ProductOrder WHERE id = ?',
      [id],
    );

    if (!orderRows || orderRows.length === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const order = orderRows[0] as Order;

    // Delete order (cascade will delete items)
    await this.dbService.connection.query(
      'DELETE FROM ProductOrder WHERE id = ?',
      [id],
    );

    return order;
  }
}
