import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { WorkplacesService } from './workplaces.service';
import { CreateWorkplaceDto } from './dto/create-workplace.dto';
import { UpdateWorkplaceDto } from './dto/update-workplace.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateWorkplaceEmployeesDto } from './dto/update-workplace-employees.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Рабочие места')
@Controller('workplaces')
@UseGuards(JwtAuthGuard)
export class WorkplacesController {
  constructor(private readonly workplacesService: WorkplacesService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  create(@Body() createWorkplaceDto: CreateWorkplaceDto) {
    return this.workplacesService.create(createWorkplaceDto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER')
  findAll() {
    return this.workplacesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER')
  findOne(@Param('id') id: string) {
    return this.workplacesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() updateWorkplaceDto: UpdateWorkplaceDto) {
    return this.workplacesService.update(+id, updateWorkplaceDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.workplacesService.remove(+id);
  }

  @Patch(':id/employees')
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Обновить список сотрудников на рабочем месте' })
  @ApiResponse({ 
    status: 200, 
    description: 'Список сотрудников успешно обновлен',
    schema: {
      example: {
        message: 'Список сотрудников успешно обновлен',
        employees: [
          {
            id: 1,
            name: 'Иван',
            surname: 'Иванов',
            patronymic: 'Иванович',
            phone: '+79999999999',
            role: 'PIZZAMAKER'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Рабочее место или сотрудники не найдены' })
  updateEmployees(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkplaceEmployeesDto,
  ) {
    return this.workplacesService.updateWorkplaceEmployees(+id, updateDto);
  }

  @Get(':id/employees')
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Получить список сотрудников на рабочем месте' })
  @ApiResponse({ 
    status: 200, 
    description: 'Список сотрудников рабочего места',
    type: [Object]
  })
  getEmployees(@Param('id') id: string) {
    return this.workplacesService.getWorkplaceEmployees(+id);
  }
}
