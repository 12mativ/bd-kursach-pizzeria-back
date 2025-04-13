import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePizzaDto {
  @ApiProperty({ example: 'Маргарита' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Классическая пицца с томатами и сыром' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 450 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ type: 'string', format: 'binary' })
  image?: Express.Multer.File;
} 