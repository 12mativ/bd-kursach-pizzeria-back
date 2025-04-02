import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEnum } from "class-validator";

export class CreateWorkplaceDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsEnum(['free', 'occupied', 'partly occupied'])
  @ApiProperty({ enum: ['free', 'occupied', 'partly occupied'] })
  status: string;
}
