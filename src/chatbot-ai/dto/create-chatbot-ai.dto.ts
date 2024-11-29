import { IsOptional, IsString } from "class-validator";

export class CreateChatbotAiDto {
    @IsString()
    symptom: string

    @IsOptional()
    conversationId: string
}
