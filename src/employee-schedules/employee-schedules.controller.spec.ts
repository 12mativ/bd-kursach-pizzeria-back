import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeSchedulesController } from './employee-schedules.controller';
import { EmployeeSchedulesService } from './employee-schedules.service';

describe('EmployeeSchedulesController', () => {
  let controller: EmployeeSchedulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeSchedulesController],
      providers: [EmployeeSchedulesService],
    }).compile();

    controller = module.get<EmployeeSchedulesController>(EmployeeSchedulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
