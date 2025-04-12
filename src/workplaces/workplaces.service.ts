import { Injectable } from '@nestjs/common';
import { CreateWorkplaceDto } from './dto/create-workplace.dto';
import { UpdateWorkplaceDto } from './dto/update-workplace.dto';
import { DatabaseService } from '../database.service';
import { UpdateWorkplaceEmployeesDto } from './dto/update-workplace-employees.dto';

export interface Workplace {
  id: number;
  name: string;
  status: string;
}

@Injectable()
export class WorkplacesService {
  constructor(private dbService: DatabaseService) {}

  async create(createWorkplaceDto: CreateWorkplaceDto): Promise<Workplace> {
    const newWorkplace = await this.dbService.insertAndReturn<Workplace>(
      'Workplace',
      createWorkplaceDto,
    );

    return newWorkplace;
  }

  async findAll() {
    const sql = 'SELECT * FROM Workplace;';
    const [workplaces] = await this.dbService.connection.query(sql);
    return workplaces;
  }

  async findOne(id: number) {
    const [workplaces] = await this.dbService.connection.query(
      'SELECT * FROM Workplace WHERE id = ?',
      [id],
    );
    return workplaces[0];
  }

  async update(id: number, updateWorkplaceDto: UpdateWorkplaceDto) {
    const updatedWorkplace = await this.dbService.updateAndReturn<Workplace>(
      'Workplace',
      id,
      updateWorkplaceDto
    );

    return updatedWorkplace;
  }

  async remove(id: number) {
    const deletedWorkplace = await this.dbService.deleteAndReturn<Workplace | null>(
      'Workplace',
      id,
    )

    return deletedWorkplace;
  }

  async updateWorkplaceEmployees(id: number, updateDto: UpdateWorkplaceEmployeesDto) {
    const { employeeIds } = updateDto;

    // Проверяем существование рабочего места
    const [workplaces] = await this.dbService.connection.query(
      'SELECT * FROM Workplace WHERE id = ?',
      [id],
    );
    if (!workplaces[0]) {
      throw new Error('Рабочее место не найдено');
    }

    // Проверяем существование всех сотрудников
    if (employeeIds.length > 0) {
      const placeholders = employeeIds.map(() => '?').join(',');
      const [employees] = await this.dbService.connection.query<any[]>(
        `SELECT id FROM Employee WHERE id IN (${placeholders})`,
        employeeIds,
      );
      if (employees.length !== employeeIds.length) {
        throw new Error('Один или несколько сотрудников не найдены');
      }
    }

    // Удаляем все текущие назначения для этого рабочего места
    await this.dbService.connection.query(
      'DELETE FROM EmployeeWorkplace WHERE workplace_id = ?',
      [id],
    );

    // Добавляем новые назначения
    if (employeeIds.length > 0) {
      const values = employeeIds.map(employeeId => [employeeId, id]);
      await this.dbService.connection.query(
        'INSERT INTO EmployeeWorkplace (employee_id, workplace_id) VALUES ?',
        [values],
      );
    }

    // Получаем обновленный список сотрудников
    const [updatedEmployees] = await this.dbService.connection.query(
      `SELECT e.* FROM Employee e
       JOIN EmployeeWorkplace ew ON e.id = ew.employee_id
       WHERE ew.workplace_id = ?`,
      [id],
    );

    return {
      message: 'Список сотрудников успешно обновлен',
      employees: updatedEmployees
    };
  }

  async getWorkplaceEmployees(id: number) {
    const [employees] = await this.dbService.connection.query(
      `SELECT e.* FROM Employee e
       JOIN EmployeeWorkplace ew ON e.id = ew.employee_id
       WHERE ew.workplace_id = ?`,
      [id],
    );
    return employees;
  }
}
