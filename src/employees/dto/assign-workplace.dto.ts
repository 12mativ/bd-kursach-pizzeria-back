import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AssignWorkplaceDto {
  @IsNumber()
  @ApiProperty({ description: 'ID рабочего места' })
  workplaceId: number;
} 