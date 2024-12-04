import { Test, TestingModule } from '@nestjs/testing';
import { DetailMedicalRecordService } from './detail-medical-record.service';

describe('DetailMedicalRecordService', () => {
  let service: DetailMedicalRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetailMedicalRecordService],
    }).compile();

    service = module.get<DetailMedicalRecordService>(DetailMedicalRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
