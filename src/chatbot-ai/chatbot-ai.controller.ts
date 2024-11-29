import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Public } from '@/modules/user-auth/guard/public.guard';
import { CreateChatbotAiDto } from './dto/create-chatbot-ai.dto';
import { ChatbotAiService } from './chatbot-ai.service';

@Public()
@Controller('chatbot-ai')
export class ChatbotAiController {
  constructor(private readonly chatbotAiService: ChatbotAiService) { }

  @Post('chat')
  async handleChat(@Body() createChatbotAiDto: CreateChatbotAiDto) {
    try {

      const response = await this.chatbotAiService.getChatResponse(createChatbotAiDto);
      return { response };
    } catch (error) {
      return { error: error.message };
    }
  }
}
