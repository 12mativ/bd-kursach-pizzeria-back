import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsEnum, IsOptional, IsNumber } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'admin', description: 'Имя пользователя' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123', description: 'Пароль' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    example: 'admin', 
    description: 'Роль пользователя',
    enum: ['admin', 'manager', 'employee']
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['admin', 'manager', 'employee'])
  role: string;

  @ApiProperty({ 
    example: 1, 
    description: 'ID сотрудника (опционально)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  employeeId?: number;
} 