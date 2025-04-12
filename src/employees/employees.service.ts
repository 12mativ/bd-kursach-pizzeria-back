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
    const newEmployee = await this.dbService.insertAndReturn<Employee>(
      'Employee',
      createEmployeeDto,
    );

    return newEmployee;
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
    const updatedEmployee = await this.dbService.updateAndReturn<Employee>(
      'Employee',
      id,
      updateEmployeeDto
    );

    return updatedEmployee;
  }

  async remove(id: number) {
    const deletedEmployee = await this.dbService.deleteAndReturn<Employee | null>(
      'Employee',
      id,
    )

    return deletedEmployee;
  }

  async assignWorkplace(employeeId: number, assignWorkplaceDto: AssignWorkplaceDto) {
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
    const [result] = await this.dbService.connection.query<import('mysql2').ResultSetHeader>(
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
