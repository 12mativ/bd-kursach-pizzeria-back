import { Controller, Post, Body, UnauthorizedException, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Успешный вход',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIs...'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.login, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }
    return this.authService.login(user);
  }

  @Post('register/client')
  @ApiOperation({ summary: 'Регистрация нового клиента' })
  @ApiBody({ type: RegisterClientDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Клиент успешно зарегистрирован',
    schema: {
      example: {
        user: {
          id: 1,
          username: 'client@example.com',
          role: 'CLIENT',
          client_id: 1
        },
        access_token: 'eyJhbGciOiJIUzI1NiIs...'
      }
    }
  })
  async registerClient(@Body() registerDto: RegisterClientDto) {
    return this.authService.registerClient(registerDto);
  }

  @Post('register/employee')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Регистрация нового сотрудника (только для администраторов)' })
  @ApiBody({ type: RegisterEmployeeDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Сотрудник успешно зарегистрирован',
    schema: {
      example: {
        user: {
          id: 1,
          username: 'employee',
          role: 'PIZZAMAKER',
          employee_id: 1
        },
        access_token: 'eyJhbGciOiJIUzI1NiIs...'
      }
    }
  })
  async registerEmployee(@Body() registerDto: RegisterEmployeeDto) {
    return this.authService.registerEmployee(registerDto);
  }

  @Get('check-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Проверка валидности сессии' })
  @ApiResponse({ 
    status: 200, 
    description: 'Сессия валидна',
    schema: {
      example: {
        valid: true,
        user: {
          id: 1,
          username: 'admin',
          role: 'ADMIN'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Невалидная сессия' })
  async checkSession(@Body() user: any) {
    return {
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };
  }
} 