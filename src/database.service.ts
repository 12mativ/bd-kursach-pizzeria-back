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

      const employeeWorkplaceSql = `
        CREATE TABLE IF NOT EXISTS EmployeeWorkplace (
          employee_id INT NOT NULL,
          workplace_id INT NOT NULL,
          PRIMARY KEY (employee_id, workplace_id),
          FOREIGN KEY (employee_id) REFERENCES Employee(id) ON DELETE CASCADE,
          FOREIGN KEY (workplace_id) REFERENCES Workplace(id) ON DELETE CASCADE
        );
      `;

      const pizzaSql = `
        CREATE TABLE IF NOT EXISTS Pizza (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          imageUrl VARCHAR(255)
        );
      `;

      const ingredientSql = `
        CREATE TABLE IF NOT EXISTS Ingredient (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          remainingQuantity INT NOT NULL
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

      const orderSql = `
        CREATE TABLE IF NOT EXISTS PizzaOrder (
          id INT AUTO_INCREMENT PRIMARY KEY,
          orderDate DATETIME NOT NULL,
          status ENUM('preparing', 'ready') NOT NULL,
          totalAmount DECIMAL(10, 2) NOT NULL
        );
      `;

      const drinkSql = `
        CREATE TABLE IF NOT EXISTS Drink (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL
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

      const sb = `
        CREATE TABLE IF NOT EXISTS PizzaIngredient (
          pizza_id INT NOT NULL,
          ingredient_id INT NOT NULL,
          PRIMARY KEY (pizza_id, ingredient_id),
          FOREIGN KEY (pizza_id) REFERENCES Pizza(id) ON DELETE CASCADE,
          FOREIGN KEY (ingredient_id) REFERENCES Ingredient(id) ON DELETE CASCADE
        );
      `;

      await this.connection.query(employeeSql);
      await this.connection.query(pizzaSql);
      await this.connection.query(ingredientSql);
      await this.connection.query(workplaceSql);
      await this.connection.query(orderSql);
      await this.connection.query(drinkSql);
      await this.connection.query(clientSql);
      await this.connection.query(userSql);
      await this.connection.query(sb);
      await this.connection.query(employeeWorkplaceSql);
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
