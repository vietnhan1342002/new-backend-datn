import { Test, TestingModule } from '@nestjs/testing';
import { DetailMedicalRecordController } from './detail-medical-record.controller';
import { DetailMedicalRecordService } from './detail-medical-record.service';

describe('DetailMedicalRecordController', () => {
  let controller: DetailMedicalRecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetailMedicalRecordController],
      providers: [DetailMedicalRecordService],
    }).compile();

    controller = module.get<DetailMedicalRecordController>(DetailMedicalRecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
