import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AssignWorkplaceDto } from './dto/assign-workplace.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Сотрудники')
@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER')
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(+id, updateEmployeeDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.employeesService.remove(+id);
  }

  @Post(':id/workplaces')
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Назначить сотрудника на рабочее место' })
  @ApiResponse({ status: 200, description: 'Сотрудник успешно назначен на рабочее место' })
  @ApiResponse({ status: 404, description: 'Сотрудник или рабочее место не найдены' })
  assignWorkplace(@Param('id') id: string, @Body() assignWorkplaceDto: AssignWorkplaceDto) {
    return this.employeesService.assignWorkplace(+id, assignWorkplaceDto);
  }

  @Delete(':id/workplaces/:workplaceId')
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Удалить сотрудника с рабочего места' })
  @ApiResponse({ status: 200, description: 'Сотрудник успешно удален с рабочего места' })
  @ApiResponse({ status: 404, description: 'Сотрудник не был назначен на это рабочее место' })
  removeWorkplace(@Param('id') id: string, @Param('workplaceId') workplaceId: string) {
    return this.employeesService.removeWorkplace(+id, +workplaceId);
  }

  @Get(':id/workplaces')
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Получить все рабочие места сотрудника' })
  @ApiResponse({ status: 200, description: 'Список рабочих мест сотрудника' })
  getEmployeeWorkplaces(@Param('id') id: string) {
    return this.employeesService.getEmployeeWorkplaces(+id);
  }
}
