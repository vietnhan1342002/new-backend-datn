import { Body, Controller, Post } from '@nestjs/common';
import { ChatbotAiService } from './chatbot-ai.service';
import { Public } from '@/modules/user-auth/guard/public.guard';

@Public()
@Controller('chat')
export class ChatBotAiController {
  constructor(private readonly chatbotAiService: ChatbotAiService) {}

  @Post('ask')
  async ask(@Body('prompt') prompt: string) {
    return this.chatbotAiService.askGPT(prompt);
  }
}
