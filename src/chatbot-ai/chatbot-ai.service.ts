import { Injectable } from '@nestjs/common';
import { ChatGroq } from "@langchain/groq";
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { Pinecone } from '@pinecone-database/pinecone';

interface UserDetails {
  name: string;
  phone: string;
}

@Injectable()
export class ChatbotAiService {
  private userDetails: UserDetails;
  private llm;
  private chatHistory = [];
  private vectorStore;
  private specialtiesData = [
    { name: "Musculoskeletal", description: "Examination and treatment of musculoskeletal diseases", isActive: true },
    { name: "Neurology", description: "Examination and treatment of neurological diseases", isActive: true },
    { name: "Digestive", description: "Examination and treatment of digestive diseases", isActive: true },
    { name: "Cardiovascular", description: "Examination and treatment of cardiovascular diseases", isActive: true },
    { name: "Ear, Nose, and Throat", description: "Examination and treatment of ear, nose, and throat diseases", isActive: true },
    { name: "Spine", description: "Diagnosis and treatment of spinal problems", isActive: true },
    { name: "Traditional Medicine", description: "Examination and treatment using traditional medicine methods", isActive: true },
    { name: "Acupuncture", description: "Application of acupuncture in treatment", isActive: true },
    { name: "Obstetrics and Gynecology", description: "Examination and treatment of obstetric and gynecological health", isActive: true },
    { name: "Prenatal ultrasound", description: "Prenatal ultrasound service", isActive: true },
    { name: "Pediatrics", description: "Examination and treatment of children", isActive: true },
    { name: "Dermatology", description: "Examination and treatment of dermatological diseases", isActive: true },
    { name: "Hepatitis", description: "Treatment and consultation of hepatitis", isActive: true },
    { name: "Mental health", description: "Examination and psychological and mental support", isActive: true },
    { name: "Allergy and immunology", description: "Diagnosis and treatment of allergy and immunology", isActive: true },
    { name: "Respiratory - Lung", description: "Examination and treatment of respiratory diseases", isActive: true },
    { name: "Neurosurgery", description: "Neurosurgery and treatment", isActive: true },
    { name: "Andrology", description: "Examination and treatment of andrology problems", isActive: true },
    { name: "Ophthalmology", description: "Examination and treatment of eye diseases", isActive: true },
    { name: "Kidney - Urology", description: "Examination and treatment of kidney and urinary diseases", isActive: true },
    { name: "Internal medicine", description: "Examination and treatment of general internal medicine", isActive: true },
    { name: "Dentistry", description: "Examination and treatment of dental problems", isActive: true },
    { name: "Diabetes - Endocrinology", description: "Diagnosis and treatment of diabetes, endocrine diseases", isActive: true },
    { name: "Rehabilitation", description: "Support and rehabilitation", isActive: true },
    { name: "Magnetic resonance imaging", description: "Magnetic resonance imaging service", isActive: true },
    { name: "Computerized tomography", description: "Computerized tomography service", isActive: true },
    { name: "Digestive endoscopy", description: "Digestive endoscopy service", isActive: true },
    { name: "Oncology", description: "Examination and treatment of tumors", isActive: true },
    { name: "Cosmetic dermatology", description: "Skin care and cosmetic treatment", isActive: true },
    { name: "Infectious diseases", description: "Examination and treatment of infectious diseases", isActive: true },
    { name: "Family doctor", description: "Family doctor service", isActive: true },
    { name: "Maxillofacial Plastic Surgery", description: "Maxillofacial Plastic Surgery Service", isActive: true },
    { name: "Psychological consultation and therapy", description: "Psychological consultation and therapy", isActive: true },
    { name: "Infertility - Infertility", description: "Infertility and infertility examination and treatment", isActive: true },
    { name: "Orthopedic trauma", description: "Orthopedic trauma treatment", isActive: true },
    { name: "Braces", description: "Braces service", isActive: true },
    { name: "Porcelain crowns", description: "Porcelain crowns service", isActive: true },
    { name: "Implant dentistry", description: "Implant dentistry service", isActive: true },
    { name: "Wisdom tooth extraction", description: "Wisdom tooth extraction service", isActive: true },
    { name: "General dentistry", description: "General dental examination and treatment", isActive: true },
    { name: "Pediatric dentistry", description: "Dental examination and treatment for children", isActive: true },
    { name: "Thyroid", description: "Thyroid examination and treatment", isActive: true },
    { name: "Breast specialist", description: "Breast specialist examination and treatment", isActive: true },
  ];


  constructor() {
    const apiKey = "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";
    this.llm = new ChatGroq({
      model: 'gemma2-9b-it',
      temperature: 0,
      apiKey
    });

    const pc = new Pinecone({
      apiKey: "pcsk_6exEkN_LwZnN4UQRXRdb1qYnRg4JGdkn8ewi6zG8pRkwRyuLAXQB4ZGgiLsMKXXwQTHCFd"
    });
    const index = pc.index('langchain-chatbot');
    this.vectorStore = index; // Sử dụng sau này nếu cần tích hợp thêm tính năng tìm kiếm.
  }

  async processMessage(input: string) {
    const farewellKeywords = ['bye', 'goodbye', 'see you', 'later', 'farewell', 'take care'];
    const affirmativeKeywords = ['yes', 'yeah', 'sure', 'okay'];

    // Kiểm tra nếu input chứa từ khoá chia tay
    if (farewellKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
      this.chatHistory = [];
      return {
        message: 'Goodbye! The chat history has been cleared. Feel free to start a new conversation anytime!',
      };
    }

    // Xử lý phản hồi "Yes" trong ngữ cảnh đặt lịch hẹn
    if (affirmativeKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
      if (this.chatHistory.some(msg =>
        msg.content.includes("Would you like to make an appointment?")
      )) {
        const userPrompt = ChatPromptTemplate.fromMessages([
          ['system', 'Please ask the user for their full name and phone number.'],
          new MessagesPlaceholder({ variableName: 'chat_history' }),
          ['human', '{input}'],
        ]);

        console.log('input', input);


        const formattedAppointmentPrompt = await userPrompt.format({
          chat_history: this.chatHistory,
          input,
        });

        try {
          const response = await this.llm.invoke(formattedAppointmentPrompt);

          this.chatHistory.push(new HumanMessage({ content: input }));
          this.chatHistory.push(new AIMessage({ content: response.content }));

          return { message: response.content, nextStep: 'get_appointment_details' };
        } catch (error) {
          console.error('Error processing appointment message:', error);
          return { message: 'Sorry, there was an error processing your request to book an appointment. Please try again later.' };
        }
      }
    }



    // Tạo prompt khi người dùng yêu cầu đặt lịch
    if (input.toLowerCase().includes("book an appointment")) {
      const appointmentPrompt = ChatPromptTemplate.fromMessages([
        ['system', 'You are a helpful assistant for scheduling appointments in a health clinic. Please ask the user for the necessary details to book an appointment.'],
        new MessagesPlaceholder({ variableName: 'chat_history' }),
        ['human', '{input}'],
      ]);

      const formattedAppointmentPrompt = await appointmentPrompt.format({
        chat_history: this.chatHistory,
        input,
      });

      try {
        const response = await this.llm.invoke(formattedAppointmentPrompt);

        this.chatHistory.push(new HumanMessage({ content: input }));
        this.chatHistory.push(new AIMessage({ content: response.content }));

        return { message: response.content, nextStep: 'get_appointment_details' };
      } catch (error) {
        console.error('Error processing appointment message:', error);
        return { message: 'Sorry, there was an error processing your request to book an appointment. Please try again later.' };
      }
    }

    // Tạo prompt dựa trên lịch sử trò chuyện
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `
        You are a helpful assistant in health.
        Say greetings first. Then ask how you can help.
        You can only ask one question at a time and give examples for them.
        Ask and wait for them to answer.
        After 1 question, you conclude with a possible disease diagnosis, severity level, and temporary home precautions.
        From the list of ${this.specialtiesData}, predict which specialty the patient is in, just in the list above.
        Ask them Would you like to make an appointment?.
      `],
      new MessagesPlaceholder({ variableName: 'chat_history' }),
      ['human', '{input}'],
    ]);

    const formattedPrompt = await prompt.format({
      chat_history: this.chatHistory,
      input,
    });

    try {
      const response = await this.llm.invoke(formattedPrompt);

      let jsonResponse;
      try {
        jsonResponse = JSON.parse(response.content);
      } catch (error) {
        jsonResponse = { message: response.content.trim().replace(/^AI:\s*/, '') };
      }

      this.chatHistory.push(new HumanMessage({ content: input }));
      this.chatHistory.push(new AIMessage({ content: response.content }));

      return jsonResponse;
    } catch (error) {
      console.error('Error processing message:', error);
      return { message: 'Sorry, there was an error processing your request. Please try again later.' };
    }
  }

}
