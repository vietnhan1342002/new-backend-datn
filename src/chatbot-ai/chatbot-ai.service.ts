import { Injectable } from '@nestjs/common';
import { ChatGroq } from "@langchain/groq";
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { Pinecone } from '@pinecone-database/pinecone';
import { UserAuthService } from '@/modules/user-auth/user-auth.service';
import { CreateUserAuthDto } from '@/modules/user-auth/dto/create-user-auth.dto';
import { Types } from 'mongoose';
import { SpecialtiesService } from '@/modules/specialties/specialties.service';

interface UserDetails {
  name: string;
  phone: string;
}

@Injectable()
export class ChatbotAiService {
  private userDetails: UserDetails = { name: '', phone: '' };
  private llm;
  private chatHistory = [];
  private specialtiesData: string[] = [];
  private vectorStore;
  // private specialtiesData = [
  //   { name: "Musculoskeletal", description: "Examination and treatment of musculoskeletal diseases" },
  //   { name: "Neurology", description: "Examination and treatment of neurological diseases" },
  //   { name: "Digestive", description: "Examination and treatment of digestive diseases" },
  //   { name: "Cardiovascular", description: "Examination and treatment of cardiovascular diseases" },
  //   { name: "Ear, Nose, and Throat", description: "Examination and treatment of ear, nose, and throat diseases" },
  //   { name: "Spine", description: "Diagnosis and treatment of spinal problems" },
  //   { name: "Traditional Medicine", description: "Examination and treatment using traditional medicine methods" },
  //   { name: "Acupuncture", description: "Application of acupuncture in treatment" },
  //   { name: "Obstetrics and Gynecology", description: "Examination and treatment of obstetric and gynecological health" },
  //   { name: "Prenatal ultrasound", description: "Prenatal ultrasound service" },
  //   { name: "Pediatrics", description: "Examination and treatment of children" },
  //   { name: "Dermatology", description: "Examination and treatment of dermatological diseases" },
  //   { name: "Hepatitis", description: "Treatment and consultation of hepatitis" },
  //   { name: "Mental health", description: "Examination and psychological and mental support" },
  //   { name: "Allergy and immunology", description: "Diagnosis and treatment of allergy and immunology" },
  //   { name: "Respiratory - Lung", description: "Examination and treatment of respiratory diseases" },
  //   { name: "Neurosurgery", description: "Neurosurgery and treatment" },
  //   { name: "Andrology", description: "Examination and treatment of andrology problems" },
  //   { name: "Ophthalmology", description: "Examination and treatment of eye diseases" },
  //   { name: "Kidney - Urology", description: "Examination and treatment of kidney and urinary diseases" },
  //   { name: "Internal medicine", description: "Examination and treatment of general internal medicine" },
  //   { name: "Dentistry", description: "Examination and treatment of dental problems" },
  //   { name: "Diabetes - Endocrinology", description: "Diagnosis and treatment of diabetes, endocrine diseases" },
  //   { name: "Rehabilitation", description: "Support and rehabilitation" },
  //   { name: "Magnetic resonance imaging", description: "Magnetic resonance imaging service" },
  //   { name: "Computerized tomography", description: "Computerized tomography service" },
  //   { name: "Digestive endoscopy", description: "Digestive endoscopy service" },
  //   { name: "Oncology", description: "Examination and treatment of tumors" },
  //   { name: "Cosmetic dermatology", description: "Skin care and cosmetic treatment" },
  //   { name: "Infectious diseases", description: "Examination and treatment of infectious diseases" },
  //   { name: "Family doctor", description: "Family doctor service" },
  //   { name: "Maxillofacial Plastic Surgery", description: "Maxillofacial Plastic Surgery Service" },
  //   { name: "Psychological consultation and therapy", description: "Psychological consultation and therapy" },
  //   { name: "Infertility - Infertility", description: "Infertility and infertility examination and treatment" },
  //   { name: "Orthopedic trauma", description: "Orthopedic trauma treatment" },
  //   { name: "Braces", description: "Braces service" },
  //   { name: "Porcelain crowns", description: "Porcelain crowns service" },
  //   { name: "Implant dentistry", description: "Implant dentistry service" },
  //   { name: "Wisdom tooth extraction", description: "Wisdom tooth extraction service" },
  //   { name: "General dentistry", description: "General dental examination and treatment" },
  //   { name: "Pediatric dentistry", description: "Dental examination and treatment for children" },
  //   { name: "Thyroid", description: "Thyroid examination and treatment" },
  //   { name: "Breast specialist", description: "Breast specialist examination and treatment" },
  // ];


  constructor(
    private userAuthService: UserAuthService,
    private specialtiesService: SpecialtiesService,
  ) {
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
    this.vectorStore = index; // Use later if you need to integrate search functionality.
  }


  private parseAIResponse(responseContent: string): { message: string } {
    try {
      return JSON.parse(responseContent);
    } catch (error) {
      // Nếu không thể parse JSON, xử lý như văn bản thông thường
      return { message: responseContent.trim().replace(/^AI:\s*/, '') };
    }
  }


  async processMessage(input: string) {
    const farewellKeywords = ['bye', 'goodbye', 'see you', 'later', 'farewell', 'take care'];
    const greetingKeywords = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'];
    let specialtyUser = '';
    let date = '';

    if (greetingKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
      this.chatHistory = [];
      this.userDetails.name = '';
      this.userDetails.phone = '';
    }

    // Check if input contains the breakup keyword
    if (farewellKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
      this.chatHistory = [];
      this.userDetails.name = '';
      this.userDetails.phone = '';
      return {
        message: 'Goodbye! The chat history has been cleared. Feel free to start a new conversation anytime!',
      };
    }



    // Check if input Have a good day
    if (this.chatHistory.some(msg =>
      msg.content.includes("Have a good day!")
    )) {
      this.chatHistory = [];
      this.userDetails.name = '';
      this.userDetails.phone = '';
    }

    if (this.specialtiesData.length === 0) {
      this.specialtiesData = await this.specialtiesService.findAllName();
    }


    // Tạo prompt dựa trên lịch sử trò chuyện
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `
        You are a helpful assistant in health.
        Say greetings first. Then ask how you can help.
        You can only ask one question at a time and give examples for them.
        Ask and wait for them to answer.
        After 3 question, you conclude with a possible disease diagnosis, severity level, and temporary home precautions.
        Then from the list of ${this.specialtiesData}, predict which specialty the patient is in, just in the list above and only one specialty. 
        Next Answer" "Specialty can be: **speciaty predict**."
        Finally, ask them Would you like to make an appointment?.
        If user agree. Ask What is your name? Format: My name is [your name], [your phone number][only 10 numbers]. 
        Else, answer: "Have a good day!".
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

      const jsonResponse = this.parseAIResponse(response.content);

      this.chatHistory.push(new HumanMessage({ content: input }));
      this.chatHistory.push(new AIMessage({ content: response.content }));

      //collect specialty
      if (response.content.includes("Specialty can be:")) {
        // Xử lý đoạn văn bản để lấy specialty
        const specialtyRegex = /Specialty can be:\s*(.*?)(\.|\n|$)/;
        const specialtyMatch = response.content.match(specialtyRegex);

        if (specialtyMatch) {
          let specialty = specialtyMatch[1].trim(); // Lấy nội dung sau "Specialty can be:"
          specialty = specialty.replace(/\*\*/g, '').trim();
          if (specialtyUser.length === 0) {
            specialtyUser = specialty;
            console.log(`Extracted Specialty: ${specialtyUser}`);
          }
        } else {
          const responseMessage = "No specific specialty found after 'Specialty can be:'";
          this.chatHistory.push(new AIMessage({ content: responseMessage }));
          return { message: responseMessage };
        }
      }


      //collect user information
      if (input.includes('My name is')) {
        const namePhoneRegex = /My name is ([A-Za-z\s]+), (\d{10}).?$/;
        const match = input.match(namePhoneRegex);

        if (match) {
          const fullName = (this.userDetails.name = match[1]);
          const phoneNumber = (this.userDetails.phone = match[2]).toString();
          const existingUser = await this.userAuthService.checkPhoneExists(phoneNumber);
          if (existingUser) {
            return { message: 'Phone number already exists. Please use a different phone number.' };
          }
          const password = '123456';
          const createUserAuthDto: CreateUserAuthDto = {
            fullName,
            phoneNumber,
            password,
            roleId: new Types.ObjectId('673d931c35e97c832bfa6351')
          };
          console.log(createUserAuthDto);
          // const user = await this.userAuthService.register(createUserAuthDto);
          const response = "I created an account for you with a phone and password is 123456.\nWhat date would you like to schedule your appointment? Please provide a date in the format YYYY-MM-DD.";
          this.chatHistory.push(new AIMessage({ content: response }));
          return {
            message: response,
            // _id: user._id
          };
        } else {
          return { message: 'Invalid input format. Please ensure your name and phone number are entered correctly.' };
        }
      }

      //collect date
      if (input.match(/My name is [A-Za-z\s]+, (\d{10})/)) {
        const response = "What date would you like to schedule your appointment? Please provide a date in the format YYYY-MM-DD.";
        this.chatHistory.push(new AIMessage({ content: response }));
        return { message: response };
      }

      const dateRegex = /\b(\d{4}-\d{2}-\d{2})\b/;
      const dateMatch = input.match(dateRegex);
      if (dateMatch) {
        const appointmentDate = dateMatch[1];
        if (date.length === 0) {
          date = appointmentDate
          console.log(`Appointment Date: ${date}`);
        }
        const response = `Your appointment has been scheduled for ${date}.`;
        this.chatHistory.push(new AIMessage({ content: response }));
        return { message: response };
      }

      return jsonResponse;
    } catch (error) {
      console.error('Error processing message:', error);
      return { message: 'Sorry, there was an error processing your request. Please try again later.' };
    }

  }

}
