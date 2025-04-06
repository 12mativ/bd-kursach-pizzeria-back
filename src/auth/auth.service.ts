import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database.service';
import * as bcrypt from 'bcrypt';
import { RegisterClientDto } from './dto/register-client.dto';
import { RegisterEmployeeDto } from './dto/register-employee.dto';

interface Client {
  id: number;
  name: string;
  surname: string;
  patronymic: string | null;
  phone: string;
  email: string;
}

interface Employee {
  id: number;
  name: string;
  surname: string;
  patronymic: string | null;
  phone: string;
}

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  employee_id: number | null;
  client_id: number | null;
}

@Injectable()
export class AuthService {
  constructor(
    private dbService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const sql = 'SELECT * FROM User WHERE username = ?';
    const [users] = await this.dbService.connection.query(sql, [username]);
    const user = users[0];

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async registerClient(registerDto: RegisterClientDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Создаем клиента
    const client = await this.dbService.insertAndReturn<Client>('Client', {
      name: registerDto.name,
      surname: registerDto.surname,
      patronymic: registerDto.patronymic,
      phone: registerDto.phone,
      email: registerDto.email,
    });

    // Создаем пользователя
    const newUser = await this.dbService.insertAndReturn<User>('User', {
      username: registerDto.email,
      password: hashedPassword,
      role: 'CLIENT',
      client_id: client.id,
      employee_id: null,
    });

    const { password, ...result } = newUser;
    return result;
  }

  async registerEmployee(registerDto: RegisterEmployeeDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Создаем сотрудника
    const employee = await this.dbService.insertAndReturn<Employee>('Employee', {
      name: registerDto.name,
      surname: registerDto.surname,
      patronymic: registerDto.patronymic,
      phone: registerDto.phone,
    });

    // Создаем пользователя
    const newUser = await this.dbService.insertAndReturn<User>('User', {
      username: registerDto.username,
      password: hashedPassword,
      role: registerDto.role,
      employee_id: employee.id,
      client_id: null,
    });

    const { password, ...result } = newUser;
    return result;
  }
} 