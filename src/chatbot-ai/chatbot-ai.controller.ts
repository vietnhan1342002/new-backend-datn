import { Body, Controller, Post } from '@nestjs/common';
import { ChatbotAiService } from './chatbot-ai.service';
import { Public } from '@/modules/user-auth/guard/public.guard';

@Public()
@Controller('chat')
export class ChatBotAiController {
  constructor(private readonly chatbotAiService: ChatbotAiService) { }

  @Post('message')
  async handleMessage(@Body('message') message: string) {
    const response = await this.chatbotAiService.processMessage(message);
    return { response };
  }

  @Post('test')
  async chat(@Body() chatDTO: { message: string }) {
    try {
      const aiResponse = await this.chatbotAiService.chatWithAI(chatDTO);
      return { message: aiResponse };
    } catch (error) {
      return { message: 'An error occurred while processing your request.' };
    }
  }
}
