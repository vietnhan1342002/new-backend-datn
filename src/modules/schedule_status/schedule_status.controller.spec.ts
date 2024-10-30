import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleStatusController } from './schedule_status.controller';
import { ScheduleStatusService } from './schedule_status.service';

describe('ScheduleStatusController', () => {
  let controller: ScheduleStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleStatusController],
      providers: [ScheduleStatusService],
    }).compile();

    controller = module.get<ScheduleStatusController>(ScheduleStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
