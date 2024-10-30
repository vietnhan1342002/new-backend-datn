import { Test, TestingModule } from '@nestjs/testing';
import { AppointmetsService } from './appointmets.service';

describe('AppointmetsService', () => {
  let service: AppointmetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppointmetsService],
    }).compile();

    service = module.get<AppointmetsService>(AppointmetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
