import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotAiService } from './chatbot-ai.service';

describe('ChatbotAiService', () => {
  let service: ChatbotAiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatbotAiService],
    }).compile();

    service = module.get<ChatbotAiService>(ChatbotAiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
