import { Module } from '@nestjs/common';
import { ChatbotAiService } from './chatbot-ai.service';
import { ChatBotAiController } from './chatbot-ai.controller';
import { UserAuthModule } from '@/modules/user-auth/user-auth.module';
import { SpecialtiesModule } from '@/modules/specialties/specialties.module';

@Module({
  imports: [
    UserAuthModule,
    SpecialtiesModule
  ],
  controllers: [ChatBotAiController],
  providers: [ChatbotAiService],
})
export class ChatbotAiModule { }
