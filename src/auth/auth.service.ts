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
  role: string;
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

  async validateUser(login: string, password: string): Promise<any> {
    const sql = `
      SELECT u.*, c.email 
      FROM User u 
      LEFT JOIN Client c ON u.client_id = c.id 
      WHERE u.username = ? OR c.email = ?
    `;
    const [users] = await this.dbService.connection.query(sql, [login, login]);
    const user = users[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
      clientId: user.client_id,
      employeeId: user.employee_id,
    };
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

    await this.dbService.connection.query(
      `INSERT INTO UserClient (user_id, client_id) VALUES (?, ?)`,
      [newUser.id, client.id],
    );

    return {
      user: result,
      access_token: this.jwtService.sign({
        username: result.username,
        sub: result.id,
        role: result.role,
        clientId: result.client_id,
        employeeId: result.employee_id,
      }),
    };
  }

  async registerEmployee(registerDto: RegisterEmployeeDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Создаем сотрудника
    const employee = await this.dbService.insertAndReturn<Employee>(
      'Employee',
      {
        name: registerDto.name,
        surname: registerDto.surname,
        patronymic: registerDto.patronymic,
        phone: registerDto.phone,
        role: registerDto.role,
      },
    );

    // Создаем пользователя
    const newUser = await this.dbService.insertAndReturn<User>('User', {
      username: registerDto.username,
      password: hashedPassword,
      role: registerDto.role,
      employee_id: employee.id,
      client_id: null,
    });

    const { password, ...result } = newUser;
    return {
      user: result,
      access_token: this.jwtService.sign({
        username: result.username,
        sub: result.id,
        role: result.role,
        clientId: result.client_id,
        employeeId: result.employee_id,
      }),
    };
  }

  async getClientId(id: number) {
    const [clientId] = await this.dbService.connection.query(
      `SELECT client_id FROM UserClient WHERE user_id = ?`,
      [id],
    );
  }

  async checkSession(req: Request) {
    try {
      // Получаем полные данные пользователя из БД
      const [user] = await this.dbService.connection.query(
        `SELECT id, username, role, employee_id, client_id 
           FROM User 
           WHERE id = ?`,
        //@ts-ignore
        [req.user.id],
      );
      
      //@ts-ignore
      if (!user || user.length === 0) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      return {
        valid: true,
        user: {
          id: user[0].id,
          username: user[0].username,
          role: user[0].role,
          employeeId: user[0].employee_id,
          clientId: user[0].client_id,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Невалидная сессия');
    }
  }
}
