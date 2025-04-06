import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsEmail, Matches } from 'class-validator';

export class RegisterClientDto {
  @ApiProperty({ example: 'Иван', description: 'Имя клиента' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Иванов', description: 'Фамилия клиента' })
  @IsString()
  @IsNotEmpty()
  surname: string;

  @ApiProperty({ example: 'Иванович', description: 'Отчество клиента', required: false })
  @IsString()
  patronymic?: string;

  @ApiProperty({ example: '+79991234567', description: 'Номер телефона клиента' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+7\d{10}$/, { message: 'Номер телефона должен быть в формате +7XXXXXXXXXX' })
  phone: string;

  @ApiProperty({ example: 'client@example.com', description: 'Email клиента' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Пароль' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
} 