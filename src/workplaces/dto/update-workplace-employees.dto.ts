import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class UpdateWorkplaceEmployeesDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @ApiProperty({ 
    description: 'Массив ID сотрудников, которые должны быть назначены на рабочее место',
    type: [Number]
  })
  employeeIds: number[];
} 