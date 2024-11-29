import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotAiController } from './chatbot-ai.controller';
import { ChatbotAiService } from './chatbot-ai.service';

describe('ChatbotAiController', () => {
  let controller: ChatbotAiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotAiController],
      providers: [ChatbotAiService],
    }).compile();

    controller = module.get<ChatbotAiController>(ChatbotAiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
