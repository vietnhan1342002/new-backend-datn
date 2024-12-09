import { Module } from '@nestjs/common';
import { ChatbotAiService } from './chatbot-ai.service';
import { ChatBotAiController } from './chatbot-ai.controller';
import { UserAuthModule } from '@/modules/user-auth/user-auth.module';
import { SpecialtiesModule } from '@/modules/specialties/specialties.module';
import { FilterModule } from '@/modules/filter/filter.module';

@Module({
  imports: [
    UserAuthModule,
    SpecialtiesModule,
    FilterModule
  ],
  controllers: [ChatBotAiController],
  providers: [ChatbotAiService],
})
export class ChatbotAiModule { }
