import { Injectable, Logger } from '@nestjs/common';
import { createConnection, Connection } from 'mysql2/promise';

@Injectable()
export class DatabaseService {
  // Property to hold the connection to MySQL database
  public connection: Connection;
  // Logger instance
  private readonly logger = new Logger(DatabaseService.name);

  // Call the connect method when an instance of DatabaseService is created
  constructor() {
    this.connect();
  }

  private async connect() {
    try {
      // Attempt to create a connection to MySQL
      this.connection = await createConnection({
        host: 'localhost',
        user: 'admin',
        password: 'admin',
        database: 'bd-kursach-pizzeria',
      });
      // Log a message if the connection is successful
      this.logger.log('Connected to MySQL database');

      const productSql = `
        CREATE TABLE IF NOT EXISTS Product (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          imageUrl VARCHAR(255),
          productType ENUM('PIZZA', 'DRINK') NOT NULL,
          available BOOLEAN NOT NULL DEFAULT TRUE
        );
      `;

      const productVariant = `
        CREATE TABLE IF NOT EXISTS ProductVariant (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          variant_name VARCHAR(100) NOT NULL,
          price_modifier DECIMAL(10, 2) NOT NULL,
          FOREIGN KEY (product_id) REFERENCES Product(id) ON DELETE CASCADE
        );
      `;

      const productOrderSql = `
        CREATE TABLE IF NOT EXISTS ProductOrder (
          id INT AUTO_INCREMENT PRIMARY KEY,
          orderDate DATETIME NOT NULL,
          status ENUM('preparing', 'ready') NOT NULL,
          totalAmount DECIMAL(10, 2) NOT NULL
        );
      `;

      const productOrderItem = `
        CREATE TABLE IF NOT EXISTS ProductOrderItem (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          product_id INT NOT NULL,
          variant_id INT,
          quantity INT NOT NULL DEFAULT 1,
          FOREIGN KEY (order_id) REFERENCES ProductOrder(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES Product(id),
          FOREIGN KEY (variant_id) REFERENCES ProductVariant(id)
        );
      `;

      const clientProductOrderSql = `
        CREATE TABLE IF NOT EXISTS ClientProductOrder (
          client_id INT NOT NULL,
          product_order_id INT NOT NULL,
          PRIMARY KEY (client_id, product_order_id),
          FOREIGN KEY (client_id) REFERENCES Client(id) ON DELETE CASCADE,
          FOREIGN KEY (product_order_id) REFERENCES ProductOrder(id) ON DELETE CASCADE
        );
      `;

      const employeeWorkplaceSql = `
        CREATE TABLE IF NOT EXISTS EmployeeWorkplace (
          employee_id INT NOT NULL,
          workplace_id INT NOT NULL,
          PRIMARY KEY (employee_id, workplace_id),
          FOREIGN KEY (employee_id) REFERENCES Employee(id) ON DELETE CASCADE,
          FOREIGN KEY (workplace_id) REFERENCES Workplace(id) ON DELETE CASCADE
        );
      `;

      const workplaceSql = `
        CREATE TABLE IF NOT EXISTS Workplace (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          status ENUM('free', 'occupied', 'partly occupied') NOT NULL,
          capacity INT NOT NULL
        );
      `;

      const employeeSql = `
        CREATE TABLE IF NOT EXISTS Employee (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          surname VARCHAR(255) NOT NULL,
          patronymic VARCHAR(255),
          phone VARCHAR(15) NOT NULL,
          role VARCHAR(50) NOT NULL
        );
      `;

      const clientSql = `
        CREATE TABLE IF NOT EXISTS Client (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          surname VARCHAR(255) NOT NULL,
          patronymic VARCHAR(255),
          phone VARCHAR(15) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL
        );
      `;

      const userSql = `
        CREATE TABLE IF NOT EXISTS User (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role ENUM('ADMIN', 'MANAGER', 'PIZZAMAKER', 'CASHIER', 'CLIENT') NOT NULL,
          employee_id INT,
          client_id INT,
          FOREIGN KEY (employee_id) REFERENCES Employee(id) ON DELETE SET NULL,
          FOREIGN KEY (client_id) REFERENCES Client(id) ON DELETE SET NULL
        );
      `;

      const userClientSql = `
        CREATE TABLE IF NOT EXISTS UserClient (
          user_id INT NOT NULL,
          client_id INT NOT NULL,
          PRIMARY KEY (user_id, client_id),
          FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
          FOREIGN KEY (client_id) REFERENCES Client(id) ON DELETE CASCADE
        );
      `;

      const workShift = `
        CREATE TABLE IF NOT EXISTS WorkShift (
          id INT AUTO_INCREMENT PRIMARY KEY,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL
        );
      `

      const employeeSchedule = `
        CREATE TABLE IF NOT EXISTS EmployeeSchedule (
          id INT AUTO_INCREMENT PRIMARY KEY,
          employee_id INT NOT NULL,
          shift_id INT NOT NULL,
          work_date DATE NOT NULL,
          FOREIGN KEY (employee_id) REFERENCES Employee(id) ON DELETE CASCADE,
          FOREIGN KEY (shift_id) REFERENCES WorkShift(id) ON DELETE CASCADE,
          UNIQUE KEY unique_employee_schedule (employee_id, work_date)
        );
      `

      await this.connection.query(productSql);
      await this.connection.query(productVariant);
      await this.connection.query(productOrderSql);
      await this.connection.query(productOrderItem);
      await this.connection.query(employeeSql);
      await this.connection.query(workplaceSql);
      await this.connection.query(employeeWorkplaceSql);
      await this.connection.query(clientSql);
      await this.connection.query(userSql);
      await this.connection.query(clientProductOrderSql);
      await this.connection.query(userClientSql);
      await this.connection.query(workShift);
      await this.connection.query(employeeSchedule);
    } catch (error) {
      // Log an error message if the connection fails
      this.logger.error('Error connecting to MySQL database', error.stack);
    }
  }

  getConnection(): Connection {
    // return the connection to MySQL
    return this.connection;
  }

  async insertAndReturn<T>(
    tableName: string,
    data: Record<string, any>,
  ): Promise<T> {
    // Формируем SQL-запрос для вставки
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map(() => '?').join(', ');

    const insertSql = `
      INSERT INTO ${tableName} (${columns})
      VALUES (${placeholders});
    `;

    // Выполняем запрос на вставку
    const [insertResult] = await this.connection.query(insertSql, values);

    // Получаем ID новой записи
    //@ts-ignore
    const newId = insertResult.insertId;

    // Формируем SQL-запрос для получения новой записи
    const selectSql = `
      SELECT * FROM ${tableName} WHERE id = ?;
    `;

    // Выполняем запрос на выборку
    const [rows] = await this.connection.query(selectSql, [newId]);

    // Возвращаем новую запись
    return rows[0] as T;
  }

  async updateAndReturn<T>(
    tableName: string,
    id: number,
    data: Record<string, any>,
  ): Promise<T> {
    // Формируем SQL-запрос для обновления
    const setClause = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(', ');

    const values = Object.values(data);
    values.push(id); // Добавляем ID в конец массива значений

    const updateSql = `
      UPDATE ${tableName}
      SET ${setClause}
      WHERE id = ?;
    `;

    // Выполняем запрос на обновление
    await this.connection.query(updateSql, values);

    // Формируем SQL-запрос для получения обновленной записи
    const selectSql = `
      SELECT * FROM ${tableName} WHERE id = ?;
    `;

    // Выполняем запрос на выборку
    const [rows] = await this.connection.query(selectSql, [id]);

    // Возвращаем обновленную запись
    return rows[0] as T;
  }

  async deleteAndReturn<T>(tableName: string, id: number): Promise<T | null> {
    // Сначала получаем запись, которую будем удалять
    const [selectResult] = await this.connection.query<any[]>(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [id],
    );

    // Если запись не найдена, возвращаем null
    if (!selectResult || selectResult.length === 0) {
      return null;
    }

    // Выполняем удаление записи
    await this.connection.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);

    // Возвращаем удаленную запись
    return selectResult[0] as T;
  }
}
