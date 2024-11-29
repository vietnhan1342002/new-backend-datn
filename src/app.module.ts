import { Module } from '@nestjs/common';
import { ApiModule } from './modules/api.module';
import { ChatbotAiModule } from './chatbot-ai/chatbot-ai.module';

@Module({
  imports: [ApiModule, ChatbotAiModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
