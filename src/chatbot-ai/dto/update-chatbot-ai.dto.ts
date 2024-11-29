import { PartialType } from '@nestjs/mapped-types';
import { CreateChatbotAiDto } from './create-chatbot-ai.dto';

export class UpdateChatbotAiDto extends PartialType(CreateChatbotAiDto) {}
