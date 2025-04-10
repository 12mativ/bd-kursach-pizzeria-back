import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsEnum, Matches } from 'class-validator';

export enum EmployeeRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  PIZZAMAKER = 'PIZZAMAKER',
  CASHIER = 'CASHIER'
}

export class RegisterEmployeeDto {
  @ApiProperty({ example: 'Иван', description: 'Имя сотрудника' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Иванов', description: 'Фамилия сотрудника' })
  @IsString()
  @IsNotEmpty()
  surname: string;

  @ApiProperty({ example: 'Иванович', description: 'Отчество сотрудника', required: false })
  @IsString()
  patronymic?: string;

  @ApiProperty({ example: '+79991234567', description: 'Номер телефона сотрудника' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^7\d{10}$/, { message: 'Номер телефона должен быть в формате +7XXXXXXXXXX' })
  phone: string;

  @ApiProperty({ example: 'employee', description: 'Имя пользователя' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123', description: 'Пароль' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    example: 'ADMIN', 
    description: 'Роль сотрудника',
    enum: EmployeeRole
  })
  @IsEnum(EmployeeRole)
  @IsNotEmpty()
  role: EmployeeRole;
} 