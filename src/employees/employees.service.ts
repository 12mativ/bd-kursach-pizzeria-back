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

  update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    return `This action updates a #${id} employee`;
  }

  remove(id: number) {
    return `This action removes a #${id} employee`;
  }
}
