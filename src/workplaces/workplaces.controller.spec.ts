import { Test, TestingModule } from '@nestjs/testing';
import { WorkplacesController } from './workplaces.controller';
import { WorkplacesService } from './workplaces.service';

describe('WorkplacesController', () => {
  let controller: WorkplacesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkplacesController],
      providers: [WorkplacesService],
    }).compile();

    controller = module.get<WorkplacesController>(WorkplacesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
