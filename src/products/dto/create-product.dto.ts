import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";


export enum ProductType {
  PIZZA = 'PIZZA',
  DRINK = 'DRINK',
}


export class CreateProductDto {
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

  @IsEnum(ProductType)
  @ApiProperty({ enum: ProductType })
  productType: ProductType;
}
