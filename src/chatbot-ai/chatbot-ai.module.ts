import { Module } from '@nestjs/common';
import { ChatbotAiService } from './chatbot-ai.service';
import { ChatBotAiController } from './chatbot-ai.controller';

@Module({
  controllers: [ChatBotAiController],
  providers: [ChatbotAiService],
})
export class ChatbotAiModule {}
