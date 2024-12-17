import { Module } from '@nestjs/common';
import { ApiModule } from './modules/api.module';
import { ChatbotAiModule } from './chatbot-ai/chatbot-ai.module';
import { NotificationsGateway } from './notification.gateway';

@Module({
  imports: [ApiModule, ChatbotAiModule],
  controllers: [],
  providers: [NotificationsGateway],
})
export class AppModule { }
