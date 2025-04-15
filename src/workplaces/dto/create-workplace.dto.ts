import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateWorkplaceDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  @ApiProperty()
  @IsNotEmpty()
  capacity: number;
}
