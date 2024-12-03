import { Injectable } from '@nestjs/common';
import { ChatGroq } from '@langchain/groq';
@Injectable()
export class ChatbotAiService {
  private readonly chatGroq: ChatGroq;
  private questionCount = 0;

  constructor() {
    this.chatGroq = new ChatGroq({
      apiKey: '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',
    });
  }

  private incrementQuestionCount(): number {
    this.questionCount += 1;
    return this.questionCount;
  }

  private resetQuestionCount(): void {
    this.questionCount = 0;
  }

  async askGPT(prompt: string): Promise<string> {
    try {
      const currentCount = this.incrementQuestionCount();
      console.log(currentCount);
      if (currentCount > 5) {
        const response = await this.chatGroq.completionWithRetry({
          model: 'gemma2-9b-it',
          messages: [
            {
              "role": "system",
              "content": "Now provide a diagnosis, severity, and precautions based on the symptoms collected. ",
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 5000,
          top_p: 1,
          stream: false,
          response_format: { type: 'json_object' },
        });
        this.resetQuestionCount();
        const followUpQuestion =
          '\nWould you like to discuss another symptom or ask additional questions? (Yes/No)';
        return JSON.parse(response.choices[0].message?.content + followUpQuestion) || 'No response. Do you want to ask about another symptom?';
      }

      const response = await this.chatGroq.completionWithRetry({
        model: 'gemma2-9b-it',
        messages: [
          {
            "role": "system",
            "content": "```json\n{\n  \"role\": \"system\",\n  \"content\": \"As an assistant, your task is to diagnose possible diseases based on the user’s symptoms. Follow this step-by-step conversation process:\nAsk a follow-up question about symptoms to gather more details. Start with a friendly greeting. When the user types 'start', ask for their name, age, and gender. Then, ask the user about their initial symptom. Ask follow-up questions based on their responses to gather more symptom details. Conclude with a possible disease diagnosis, its severity level, and temporary home precautions. Ask the user if they want to continue with another symptom. If yes, repeat the process from asking for their symptom. Format your responses and questions in JSON format.\n\nExample:\n\nUser: start\nAssistant:\n{\n  \\\"question\\\": \\\"Hello! Please tell me your name, age, and gender so I can assist you better.\\\"\n}\nUser: John, 30, Male\nAssistant:\n{\n  \\\"question\\\": \\\"What symptoms are you experiencing today?\\\"\n}\nUser: I have a headache.\nAssistant:\n{\n  \\\"question\\\": \\\"Do you have any associated symptoms, such as dizziness or sensitivity to light?\\\"\n}\nUser: Yes, I also feel nauseous and have sensitivity to light.\nAssistant:\n{\n  \\\"question\\\": \\\"Have you recently experienced stress, lack of sleep, or dehydration?\\\"\n}\nUser: No, I haven’t experienced any of those.\nAssistant:\n{\n  \\\"question\\\": \\\"Does the headache feel like pressure, pounding, or stabbing pain?\\\"\n}\nUser: It feels like a pounding pain.\nAssistant:\n{\n  \\\"diagnosis\\\": \\\"Based on your symptoms, you may have a migraine.\\\",\n  \\\"severity\\\": \\\"Moderate\\\",\n  \\\"precautions\\\": \\\"Rest in a dark, quiet room, stay hydrated, and take an over-the-counter pain reliever if needed.\\\"\n}\nAssistant:\n{\n  \\\"question\\\": \\\"Would you like to discuss another symptom?\\\"\n}\nUser: Yes\nAssistant:\n{\n  \\\"question\\\": \\\"What other symptoms are you experiencing?\\\"\n}\n\nStart by greeting the user and asking their name, age, and gender when they type 'start'.\"\n}\n{\n  \"role\": \"user\",\n  \"content\": \"I have a rash\",\n}\n{\n  \"role\": \"assistant\",\n  \"content\": {\n    \"question\": \"Can you describe the rash? For example, is it itchy, red, bumpy, or does it have any other characteristics?\"\n  }\n}\n{\n  \"role\": \"user\",\n  \"content\": \"itchy\",\n}\n{\n  \"role\": \"assistant\",\n  \"content\": {\n    \"question\": \"Where is the rash located on your body? Is it on a specific area or all over?\"\n  }\n}\n{\n  \"role\": \"user\",\n  \"content\": \"My hand\",\n}\n{\n  \"role\": \"assistant\",\n  \"content\": {\n    \"question\": \"Have you come into contact with any new soaps, lotions, plants, or animals recently?\"\n  }\n}\n{\n  \"role\": \"user\",\n  \"content\": \"lotions\",\n}\n{\n  \"role\": \"assistant\",\n  \"content\": {\n    \"diagnosis\": \"Based on your symptoms, you may have contact dermatitis.\",\n    \"severity\": \"Mild\",\n    \"precautions\": \"Stop using the new lotion immediately. Apply a cool compress to the affected area and consider using an over-the-counter hydrocortisone cream. If the rash worsens or spreads, consult a doctor.\"\n  }\n}\n{\n  \"role\": \"assistant\",\n  \"content\": {\n    \"question\": \"Would you like to discuss another symptom?\"\n  }\n}\n```"
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 5000,
        top_p: 1,
        stream: false,
        response_format: { type: 'json_object' },
      });

      return (
        JSON.parse(response.choices[0].message?.content) ||
        'No response. Do you want to ask about another symptom?'
      );
    } catch (error) {
      throw new Error(`Error from GroqAI: ${error.message}`);
    }
  }
}
