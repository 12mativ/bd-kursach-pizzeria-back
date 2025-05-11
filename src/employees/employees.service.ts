import { Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { DatabaseService } from '../database.service';
import { AssignWorkplaceDto } from './dto/assign-workplace.dto';

export interface Employee {
  id: number;
  name: string;
  surname: string;
  patronymic: string;
  phone: string;
}

@Injectable()
export class EmployeesService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const data = createEmployeeDto;
  
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map(() => '?').join(', ');
  
    const insertSql = `
      INSERT INTO Employee (${columns})
      VALUES (${placeholders});
    `;
  
    const [insertResult] = await this.dbService.connection.query(insertSql, values);
  
    //@ts-ignore
    const newId = insertResult.id;
  
    const selectSql = `
      SELECT * FROM Employee WHERE id = ?;
    `;
  
    const [rows] = await this.dbService.connection.query(selectSql, [newId]);
  
    return rows[0] as Employee;
  }

  async findAll() {
    const sql = 'SELECT * FROM Employee;';
    const [employees] = await this.dbService.connection.query(sql);
    return employees;
  }

  async findOne(id: number) {
    const [employees] = await this.dbService.connection.query(
      'SELECT * FROM Employee WHERE id = ?',
      [id],
    );
    return employees[0];
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const data = updateEmployeeDto;
  
    const setClause = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(', ');
  
    const values = Object.values(data);
    values.push(id);
  
    const updateSql = `
      UPDATE Employee
      SET ${setClause}
      WHERE id = ?;
    `;
  
    await this.dbService.connection.query(updateSql, values);
  
    const selectSql = `
      SELECT * FROM Employee WHERE id = ?;
    `;
  
    const [rows] = await this.dbService.connection.query(selectSql, [id]);
  
    return rows[0] as Employee;
  }

  async remove(id: number) {
    await this.dbService.connection.query(
      'DELETE FROM User WHERE employee_id = ?',
      [id],
    );
  }

  async assignWorkplace(
    employeeId: number,
    assignWorkplaceDto: AssignWorkplaceDto,
  ) {
    const { workplaceId } = assignWorkplaceDto;

    // Проверяем существование сотрудника и рабочего места
    const [employees] = await this.dbService.connection.query(
      'SELECT * FROM Employee WHERE id = ?',
      [employeeId],
    );
    if (!employees[0]) {
      throw new Error('Сотрудник не найден');
    }

    const [workplaces] = await this.dbService.connection.query(
      'SELECT * FROM Workplace WHERE id = ?',
      [workplaceId],
    );
    if (!workplaces[0]) {
      throw new Error('Рабочее место не найдено');
    }

    // Проверяем, не назначен ли уже сотрудник на это рабочее место
    const [existingAssignments] = await this.dbService.connection.query<any[]>(
      'SELECT * FROM EmployeeWorkplace WHERE employee_id = ? AND workplace_id = ?',
      [employeeId, workplaceId],
    );
    if (existingAssignments.length > 0) {
      throw new Error('Сотрудник уже назначен на это рабочее место');
    }

    // Назначаем сотрудника на рабочее место
    await this.dbService.connection.query(
      'INSERT INTO EmployeeWorkplace (employee_id, workplace_id) VALUES (?, ?)',
      [employeeId, workplaceId],
    );

    return { message: 'Сотрудник успешно назначен на рабочее место' };
  }

  async removeWorkplace(employeeId: number, workplaceId: number) {
    const [result] = await this.dbService.connection.query<
      import('mysql2').ResultSetHeader
    >(
      'DELETE FROM EmployeeWorkplace WHERE employee_id = ? AND workplace_id = ?',
      [employeeId, workplaceId],
    );

    if (result.affectedRows === 0) {
      throw new Error('Сотрудник не был назначен на это рабочее место');
    }

    return { message: 'Сотрудник успешно удален с рабочего места' };
  }

  async getEmployeeWorkplaces(employeeId: number) {
    const [workplaces] = await this.dbService.connection.query(
      `SELECT w.* FROM Workplace w
       JOIN EmployeeWorkplace ew ON w.id = ew.workplace_id
       WHERE ew.employee_id = ?`,
      [employeeId],
    );
    return workplaces;
  }
}
