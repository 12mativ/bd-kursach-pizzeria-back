import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateProductVariantDto {
  @IsNumber()
  @ApiProperty()
  product_id: number;

  @IsString()
  @ApiProperty()
  variant_name: string;

  @IsNumber()
  @ApiProperty()
  price_modifier: number;
}