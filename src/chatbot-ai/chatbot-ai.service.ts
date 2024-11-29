import { Injectable } from '@nestjs/common';
import { Groq } from 'groq-sdk';
import { CreateChatbotAiDto } from './dto/create-chatbot-ai.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatbotAiService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq(); // Khởi tạo Groq SDK
  }

  private conversations = new Map<string, { messages: any[] }>();

  async getChatResponse(createChatbotAiDto: CreateChatbotAiDto) {
    try {

      let { conversationId, symptom } = createChatbotAiDto

      if (!conversationId) {
        conversationId = uuidv4();
      }

      // Nếu cuộc hội thoại đã tồn tại, lấy lịch sử
      const conversation = this.conversations.get(conversationId) || { messages: [] };

      // Thêm tin nhắn mới của người dùng vào lịch sử
      conversation.messages.push({
        role: 'user',
        content: symptom,
      });
      console.log(conversation, conversationId);


      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            "role": "system",
            "content": "As an assistant, your task is to diagnose possible diseases based on the user’s symptoms. Engage in a step-by-step conversation where you ask one question at a time based on the user’s responses.\n\nStart with the initial symptom provided by the user.\nAsk one follow-up question related to the initial symptom.\nBased on the user’s response, ask the second follow-up question to gather more symptoms.\nContinue asking a third question to collect comprehensive symptom details.\nConclude with a possible disease diagnosis, its severity level, and temporary home precautions.\nFormat your responses and questions in JSON format. Here’s an interaction example:\n\nUser: I have a headache.\nAssistant:\n\n{\n  \"question\": \"Do you have any associated symptoms, such as dizziness or sensitivity to light?\"\n}\nUser: Yes, I also feel nauseous and have sensitivity to light.\nAssistant:\n\n{\n  \"question\": \"Have you recently experienced stress, lack of sleep, or dehydration?\"\n}\nUser: No, I haven’t experienced any of those.\nAssistant:\n\n{\n  \"question\": \"Does the headache feel like pressure, pounding, or stabbing pain?\"\n}\nUser: It feels like a pounding pain.\nAssistant:\n\n{\n  \"diagnosis\": \"Based on your symptoms, you may have a migraine.\",\n  \"severity\": \"Moderate\",\n  \"precautions\": \"Rest in a dark, quiet room, stay hydrated, and take an over-the-counter pain reliever if needed.\"\n}"
          },
          ...conversation.messages,
        ],
        model: 'gemma2-9b-it', // Mô hình bạn đang sử dụng
        temperature: 0.5, // Độ sáng tạo
        max_tokens: 3790, // Số token tối đa
        top_p: 1,
        response_format: { type: 'json_object' },

      });
      // Thêm phản hồi của chatbot vào lịch sử
      conversation.messages.push({
        role: 'assistant',
        content: chatCompletion.choices[0].message.content,
      });

      // Lưu lại cuộc hội thoại vào bộ nhớ tạm
      this.conversations.set(conversationId, conversation);

      // Trả phản hồi
      return {
        "conversations": this.conversations,
        "conversationId": conversationId,
        "response": chatCompletion.choices[0].message.content,
      };
    } catch (error) {
      console.error('Error during Groq API call:', error);
      throw new Error('Failed to get response from Groq');
    }
  }
}


//------------------------------------------------------------------------------------//
