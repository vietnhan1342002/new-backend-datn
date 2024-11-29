import { Module } from '@nestjs/common';
import { ChatbotAiService } from './chatbot-ai.service';
import { ChatbotAiController } from './chatbot-ai.controller';

@Module({
  controllers: [ChatbotAiController],
  providers: [ChatbotAiService],
})
export class ChatbotAiModule {}
