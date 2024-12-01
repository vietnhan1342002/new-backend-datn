import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotAiService } from './chatbot-ai.service';
import { ChatBotAiController } from './chatbot-ai.controller';

describe('ChatbotAiController', () => {
  let controller: ChatBotAiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatBotAiController],
      providers: [ChatbotAiService],
    }).compile();

    controller = module.get<ChatBotAiController>(ChatBotAiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
