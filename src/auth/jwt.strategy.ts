import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private dbService: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'fcwfhgekf123-23hdhQ3', // В продакшене использовать переменные окружения
    });
  }

  async validate(payload: any) {
    const sql = 'SELECT * FROM User WHERE id = ?';
    const [users] = await this.dbService.connection.query(sql, [payload.sub]);
    const user = users[0];

    if (!user) {
      throw new UnauthorizedException();
    }

    return { id: user.id, username: user.username, role: user.role };
  }
} 