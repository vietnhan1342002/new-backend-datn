import { Test, TestingModule } from '@nestjs/testing';
import { AppointmetsController } from './appointmets.controller';
import { AppointmetsService } from './appointmets.service';

describe('AppointmetsController', () => {
  let controller: AppointmetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmetsController],
      providers: [AppointmetsService],
    }).compile();

    controller = module.get<AppointmetsController>(AppointmetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
