import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeSchedulesService } from './employee-schedules.service';

describe('EmployeeSchedulesService', () => {
  let service: EmployeeSchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeSchedulesService],
    }).compile();

    service = module.get<EmployeeSchedulesService>(EmployeeSchedulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
