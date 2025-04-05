import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database.service';
import * as bcrypt from 'bcrypt';

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  employee_id: number | null;
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

  async register(username: string, password: string, role: string, employeeId?: number) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.dbService.insertAndReturn<User>('User', {
      username,
      password: hashedPassword,
      role,
      employee_id: employeeId || null,
    });

    const { password: _, ...result } = newUser;
    return result;
  }
} 