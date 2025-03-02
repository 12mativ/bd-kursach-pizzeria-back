import { Injectable } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { DatabaseService } from 'src/database.service';

@Injectable()
export class TasksService {
  constructor(private readonly dbService: DatabaseService) {}

  async getAllTasks() {
    const connection = this.dbService.getConnection();
    const [rows] = await connection.query('SELECT * FROM tasks');
    return rows;
  }

  async createTask(task: any) {
    const connection = this.dbService.getConnection();
    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO tasks SET ?',
      task,
    );
    return { id: result.insertId, ...task };
  }
}
