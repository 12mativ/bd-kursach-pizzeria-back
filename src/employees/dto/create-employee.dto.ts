import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEnum } from "class-validator";
import { EmployeeRole } from "../../auth/dto/register-employee.dto";

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

  @IsEnum(EmployeeRole)
  @ApiProperty({ enum: EmployeeRole })
  role: EmployeeRole;
}
