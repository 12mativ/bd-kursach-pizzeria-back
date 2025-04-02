import { Injectable } from '@nestjs/common';
import { CreateWorkplaceDto } from './dto/create-workplace.dto';
import { UpdateWorkplaceDto } from './dto/update-workplace.dto';
import { DatabaseService } from '../database.service';

export interface Workplace {
  id: number;
  name: string;
  status: string;
}

@Injectable()
export class WorkplacesService {
  constructor(private dbService: DatabaseService) {}

  async create(createWorkplaceDto: CreateWorkplaceDto): Promise<Workplace> {
    const newWorkplace = await this.dbService.insertAndReturn<Workplace>(
      'Workplace',
      createWorkplaceDto,
    );

    return newWorkplace;
  }

  async findAll() {
    const sql = 'SELECT * FROM Workplace;';
    const [workplaces] = await this.dbService.connection.query(sql);
    return workplaces;
  }

  findOne(id: number) {
    return `This action returns a #${id} workplace`;
  }

  async update(id: number, updateWorkplaceDto: UpdateWorkplaceDto) {
    const updatedWorkplace = await this.dbService.updateAndReturn<Workplace>(
      'Workplace',
      id,
      updateWorkplaceDto
    );

    return updatedWorkplace;
  }

  async remove(id: number) {
    const deletedWorkplace = await this.dbService.deleteAndReturn<Workplace | null>(
      'Workplace',
      id,
    )

    return deletedWorkplace;
  }
}
