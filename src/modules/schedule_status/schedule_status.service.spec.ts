import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleStatusService } from './schedule_status.service';

describe('ScheduleStatusService', () => {
  let service: ScheduleStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleStatusService],
    }).compile();

    service = module.get<ScheduleStatusService>(ScheduleStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
