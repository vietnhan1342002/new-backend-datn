import { Module } from '@nestjs/common';
import { ChatbotAiService } from './chatbot-ai.service';
import { ChatBotAiController } from './chatbot-ai.controller';
import { UserAuthModule } from '@/modules/user-auth/user-auth.module';
import { SpecialtiesModule } from '@/modules/specialties/specialties.module';
import { FilterModule } from '@/modules/filter/filter.module';
import { PatientsModule } from '@/modules/patients/patients.module';
import { AppointmentsModule } from '@/modules/appointments/appointments.module';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Module({
  imports: [
    UserAuthModule,
    SpecialtiesModule,
    FilterModule,
    PatientsModule,
    AppointmentsModule,
  ],
  controllers: [ChatBotAiController],
  providers: [ChatbotAiService, GoogleGenerativeAI],
})
export class ChatbotAiModule { }
