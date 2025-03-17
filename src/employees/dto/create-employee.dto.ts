import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateEmployeeDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  surname: string;

  @IsString()
  @ApiProperty()
  patronymic: string;
  
  @IsString()
  @ApiProperty()
  phone: string;
}
