import { Injectable } from '@nestjs/common';
import { CreateWorkplaceDto } from './dto/create-workplace.dto';
import { UpdateWorkplaceDto } from './dto/update-workplace.dto';

@Injectable()
export class WorkplacesService {
  create(createWorkplaceDto: CreateWorkplaceDto) {
    return 'This action adds a new workplace';
  }

  findAll() {
    return `This action returns all workplaces`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workplace`;
  }

  update(id: number, updateWorkplaceDto: UpdateWorkplaceDto) {
    return `This action updates a #${id} workplace`;
  }

  remove(id: number) {
    return `This action removes a #${id} workplace`;
  }
}
