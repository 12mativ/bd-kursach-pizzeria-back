import { Injectable, Logger } from '@nestjs/common';
import { createConnection, Connection } from 'mysql2/promise';

@Injectable()
export class DatabaseService {
  // Property to hold the connection to MySQL database
  private connection: Connection; 
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

      const sql = `CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );`

    const [rows, fields] = await this.connection.query(sql);
  } catch (error) {
      // Log an error message if the connection fails
      this.logger.error('Error connecting to MySQL database', error.stack); 
    }
  }

  getConnection(): Connection {
    // return the connection to MySQL
    return this.connection; 
  }
}