import { Injectable } from '@nestjs/common';
import { ChatGroq } from '@langchain/groq';
@Injectable()
export class ChatbotAiService {
  private readonly chatGroq: ChatGroq;

  constructor() {
    this.chatGroq = new ChatGroq({
      apiKey: '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',
    });
  }

  async askGPT(prompt: string): Promise<string> {
    try {
      const response = await this.chatGroq.completionWithRetry({
        model: 'gemma2-9b-it',
        messages: [
          {
            role: 'system',
            content:
              '{\n  "role": "system",\n  "content": "As an assistant, your task is to diagnose possible diseases based on the user’s symptoms. Follow this step-by-step conversation process:\\nStart with a friendly greeting. When the user types \'start\', ask for their name, age, and gender. Then, ask the user about their initial symptom. Ask follow-up questions based on their responses to gather more symptom details. Conclude with a possible disease diagnosis, its severity level, and temporary home precautions. Format your responses and questions in JSON format.\\n\\nExample:\\n\\nUser: start\\nAssistant:\\n{\\n\\"question\\": \\"Hello! Please tell me your name, age, and gender so I can assist you better.\\"\\n}\\nUser: John, 30, Male\\nAssistant:\\n{\\n\\"question\\": \\"What symptoms are you experiencing today?\\"\\n}\\nUser: I have a headache.\\nAssistant:\\n{\\n\\"question\\": \\"Do you have any associated symptoms, such as dizziness or sensitivity to light?\\"\\n}\\nUser: Yes, I also feel nauseous and have sensitivity to light.\\nAssistant:\\n{\\n\\"question\\": \\"Have you recently experienced stress, lack of sleep, or dehydration?\\"\\n}\\nUser: No, I haven’t experienced any of those.\\nAssistant:\\n{\\n\\"question\\": \\"Does the headache feel like pressure, pounding, or stabbing pain?\\"\\n}\\nUser: It feels like a pounding pain.\\nAssistant:\\n{\\n\\"diagnosis\\": \\"Based on your symptoms, you may have a migraine.\\",\\n\\"severity\\": \\"Moderate\\",\\n\\"precautions\\": \\"Rest in a dark, quiet room, stay hydrated, and take an over-the-counter pain reliever if needed.\\"\\n}\\n\\nStart by greeting the user and asking their name, age, and gender when they type \'start\'."\n}\n          {\n            role: \'user\',\n            content: \'I have a rash\',\n          },\n          {\n            role: \'assistant\',\n            content:\n              \'{\\n"question": "Can you describe the rash? For example, is it itchy, red, bumpy, or does it have any other characteristics?"\\n} \\n\',\n          },\n          {\n            role: \'user\',\n            content: \'itchy\',\n          },\n          {\n            role: \'assistant\',\n            content:\n              \'{\\n"question": "Where is the rash located on your body? Is it on a specific area or all over?"\\n} \\n\',\n          },\n          {\n            role: \'user\',\n            content: \'My hand\',\n          },\n          {\n            role: \'assistant\',\n            content:\n              \'{\\n"question": "Have you come into contact with any new soaps, lotions, plants, or animals recently?"\\n} \\n\',\n          },\n          {\n            role: \'user\',\n            content: \'lotions\',\n          },\n          {\n            role: \'assistant\',\n            content:\n              \'{\\n"diagnosis": "Based on your symptoms, you may have a contact dermatitis.",\\n"severity": "Mild",\\n"precautions": "Stop using the new lotion immediately. Apply a cool compress to the affected area and consider using an over-the-counter hydrocortisone cream. If the rash worsens or spreads, consult a doctor."\\n} \\n\',\n          },',
          },
          {
            role: 'user',
            content: 'start',
          },
          {
            role: 'assistant',
            content:
              '{\n  "question": "Hello! Please tell me your name, age, and gender so I can assist you better."\n}',
          },
          {
            role: 'user',
            content: 'Aiden, 22, male',
          },
          {
            role: 'assistant',
            content:
              '{\n  "question": "What symptoms are you experiencing today?"\n}',
          },
          {
            role: 'user',
            content: 'I have a headache',
          },
          {
            role: 'assistant',
            content:
              '{\n  "question": "Do you have any associated symptoms, such as dizziness or sensitivity to light?"\n}',
          },
          {
            role: 'user',
            content: 'dizziness ',
          },
          {
            role: 'assistant',
            content:
              '{\n  "question": "How severe is the dizziness? Is it mild, moderate, or severe?"\n}',
          },
          {
            role: 'user',
            content: 'mild',
          },
          {
            role: 'assistant',
            content:
              '{\n  "question": "Have you experienced any recent changes in your sleep patterns, stress levels, or diet?"\n}',
          },
          {
            role: 'user',
            content: 'stress levels\n',
          },
          {
            role: 'assistant',
            content:
              '{\n  "question": "Can you describe the type of headache you are experiencing? For example, is it throbbing, sharp, or dull?"\n}',
          },
          {
            role: 'user',
            content: 'throbbing',
          },
          {
            role: 'assistant',
            content:
              '{\n  "question": "Where is the headache located? Is it on one side of your head, both sides, or in the back of your head?"\n}',
          },
          {
            role: 'user',
            content: 'both sides',
          },
          {
            role: 'assistant',
            content:
              '{\n  "diagnosis": "Based on your symptoms, you may have a tension headache.\\n",\n  "severity": "Mild",\n  "precautions": "Try applying a warm compress to your forehead and neck. Practice relaxation techniques such as deep breathing or meditation. Over-the-counter pain relievers may also help. If the headache persists or worsens, consult a doctor."\n}',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
        max_tokens: 3340,
        top_p: 1,
        stream: false,
        response_format: { type: 'json_object' },
      });
      return response.choices[0].message?.content || 'No response';
    } catch (error) {
      throw new Error(`Error from GroqAI: ${error.message}`);
    }
  }
}

//GROQ-API-KEY: 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
