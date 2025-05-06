import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EmployeeSchedulesService } from './employee-schedules.service';
import {
  AssignmentResponse,
  AssignShiftDto,
  CreateShiftDto,
  EmployeeScheduleResponse,
  ShiftResponse,
} from './dto/create-employee-schedule.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('Расписание сотрудников')
@Controller('employee-schedules')
export class EmployeeSchedulesController {
  constructor(
    private readonly employeeSchedulesService: EmployeeSchedulesService,
  ) {}

  @Post('shifts')
  @ApiOperation({
    summary: 'Создать новую смену',
    description: 'Создает новую смену с указанным временем начала и окончания',
  })
  @ApiBody({ type: CreateShiftDto })
  @ApiResponse({
    status: 201,
    type: ShiftResponse,
    description: 'Смена успешно создана',
  })
  @ApiResponse({ status: 400, description: 'Неверные входные данные' })
  async createShift(@Body() body: { start_time: string; end_time: string }) {
    return this.employeeSchedulesService.createShift(
      body.start_time,
      body.end_time,
    );
  }

  @Post('assign')
  @ApiOperation({
    summary: 'Назначить сотрудника на смену',
    description:
      'Назначает сотрудника на определенную смену в указанную дату. Если сотрудник уже назначен на эту дату, обновляет смену.',
  })
  @ApiBody({ type: AssignShiftDto })
  @ApiResponse({
    status: 201,
    type: AssignmentResponse,
    description: 'Назначение успешно создано/обновлено',
  })
  @ApiResponse({ status: 400, description: 'Неверные входные данные' })
  @ApiResponse({ status: 404, description: 'Сотрудник или смена не найдены' })
  async assignShift(
    @Body() body: { employee_id: number; shift_id: number; work_date: string },
  ) {
    return this.employeeSchedulesService.assignShift(
      body.employee_id,
      body.shift_id,
      body.work_date,
    );
  }

  @Get('employee/:id')
  @ApiOperation({
    summary: 'Получить расписание сотрудника',
    description: 'Возвращает расписание сотрудника за указанный период',
  })
  @ApiParam({ name: 'id', description: 'ID сотрудника', type: Number })
  @ApiQuery({
    name: 'start',
    description: 'Начальная дата (YYYY-MM-DD)',
    required: true,
  })
  @ApiQuery({
    name: 'end',
    description: 'Конечная дата (YYYY-MM-DD)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    type: [EmployeeScheduleResponse],
    description: 'Список назначений сотрудника',
  })
  async getEmployeeSchedule(
    @Param('id') employeeId: string,
    @Query('start') startDate: string,
    @Query('end') endDate: string,
  ) {
    return this.employeeSchedulesService.getEmployeeSchedule(
      parseInt(employeeId),
      startDate,
      endDate,
    );
  }

  @Get('shifts')
  @ApiOperation({
    summary: 'Получить список всех смен',
    description:
      'Возвращает все доступные смены, отсортированные по времени начала',
  })
  @ApiResponse({
    status: 200,
    type: [ShiftResponse],
    description: 'Список всех смен',
  })
  async getShifts() {
    return this.employeeSchedulesService.getShifts();
  }

  @Delete('assignment/:id')
  @ApiOperation({
    summary: 'Удалить назначение',
    description: 'Удаляет назначение сотрудника на смену по ID назначения',
  })
  @ApiParam({ name: 'id', description: 'ID назначения', type: Number })
  @ApiResponse({ status: 200, description: 'Назначение успешно удалено' })
  @ApiResponse({ status: 404, description: 'Назначение не найдено' })
  async deleteAssignment(@Param('id') assignmentId: string) {
    return this.employeeSchedulesService.deleteAssignment(
      parseInt(assignmentId),
    );
  }
}
