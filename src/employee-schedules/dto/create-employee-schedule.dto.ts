import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsDateString } from 'class-validator';

export class CreateShiftDto {
  @ApiProperty({ example: '08:00:00', description: 'Время начала смены' })
  start_time: string;

  @ApiProperty({ example: '16:00:00', description: 'Время окончания смены' })
  end_time: string;
}

export class AssignShiftDto {
  @ApiProperty({ example: 1, description: 'ID сотрудника' })
  @IsInt()
  employee_id: number;

  @ApiProperty({ example: 1, description: 'ID смены' })
  @IsInt()
  shift_id: number;

  @ApiProperty({ example: '2023-12-01', description: 'Дата назначения (YYYY-MM-DD)' })
  @IsDateString()
  work_date: string;
}

export class ShiftResponse {
  @ApiProperty({ example: 1, description: 'ID смены' })
  id: number;

  @ApiProperty({ example: '08:00:00', description: 'Время начала смены' })
  start_time: string;

  @ApiProperty({ example: '16:00:00', description: 'Время окончания смены' })
  end_time: string;

  @ApiProperty({ description: 'Дата создания записи' })
  created_at: Date;
}

export class EmployeeScheduleResponse {
  @ApiProperty({ example: 1, description: 'ID назначения' })
  id: number;

  @ApiProperty({ example: '2023-12-01', description: 'Дата работы' })
  work_date: string;

  @ApiProperty({ example: '08:00:00', description: 'Время начала смены' })
  start_time: string;

  @ApiProperty({ example: '16:00:00', description: 'Время окончания смены' })
  end_time: string;
}

export class AssignmentResponse {
  @ApiProperty({ example: 1, description: 'ID назначения' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID сотрудника' })
  employee_id: number;

  @ApiProperty({ example: 1, description: 'ID смены' })
  shift_id: number;

  @ApiProperty({ example: '2023-12-01', description: 'Дата работы' })
  work_date: string;

  @ApiProperty({ description: 'Дата создания записи' })
  created_at: Date;
}