import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { WorkplacesService } from './workplaces.service';
import { CreateWorkplaceDto } from './dto/create-workplace.dto';
import { UpdateWorkplaceDto } from './dto/update-workplace.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('workplaces')
@UseGuards(JwtAuthGuard)
export class WorkplacesController {
  constructor(private readonly workplacesService: WorkplacesService) {}

  @Post()
  @Roles('admin', 'manager')
  @UseGuards(RolesGuard)
  create(@Body() createWorkplaceDto: CreateWorkplaceDto) {
    return this.workplacesService.create(createWorkplaceDto);
  }

  @Get()
  findAll() {
    return this.workplacesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workplacesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() updateWorkplaceDto: UpdateWorkplaceDto) {
    return this.workplacesService.update(+id, updateWorkplaceDto);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.workplacesService.remove(+id);
  }
}
