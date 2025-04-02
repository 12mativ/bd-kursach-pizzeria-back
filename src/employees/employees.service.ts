import { Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { DatabaseService } from '../database.service';

export interface Employee {
  id: number;
  name: string;
  surname: string;
  patronymic: string;
  phone: string;
}

@Injectable()
export class EmployeesService {
  constructor(private dbService: DatabaseService) {}

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

  findOne(id: number) {
    return `This action returns a #${id} employee`;
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
}
