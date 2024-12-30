import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatGroq } from "@langchain/groq";
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { Pinecone } from '@pinecone-database/pinecone';
import { UserAuthService } from '@/modules/user-auth/user-auth.service';
import { CreateUserAuthDto } from '@/modules/user-auth/dto/create-user-auth.dto';
import { Types } from 'mongoose';
import { SpecialtiesService } from '@/modules/specialties/specialties.service';
import { FilterService } from '@/modules/filter/filter.service';
import { Status } from '@/modules/doctor-schedules/schemas/doctor-schedule.schema';
import { PatientsService } from '@/modules/patients/patients.service';
import { AppointmentsService } from '@/modules/appointments/appointments.service';
import { CreateAppointmentDto } from '@/modules/appointments/dto/create-appointment.dto';
import { ChatDTO } from './dto/chat.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolveHttpAuthSchemeConfig } from '@aws-sdk/client-s3/dist-types/auth/httpAuthSchemeProvider';

interface UserDetails {
  name: string;
  phone: string;
  email: string
}

@Injectable()
export class ChatbotAiService {
  private userDetails: UserDetails = { name: '', phone: '', email: '' };
  private llm;
  private chatHistory = [];
  private specialtiesData: string[] = [];
  private dateList: string[] = [];
  private shiftList: string;
  private vectorStore;
  private patientId: Types.ObjectId;
  private specialtyId: string;
  private date: string;
  private shift: string;

  constructor(
    private userAuthService: UserAuthService,
    private specialtiesService: SpecialtiesService,
    private filterService: FilterService,
    private patientsService: PatientsService,
    private appointmentsService: AppointmentsService,
    private readonly genAI: GoogleGenerativeAI
  ) {
    const apiKey = "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";
    this.llm = new ChatGroq({
      model: 'gemma2-9b-it',
      temperature: 0.4,
      apiKey,
      maxTokens: 3000,
      maxRetries: 2,
    });
    this.genAI = new GoogleGenerativeAI("AIzaSyCYqyTjiUU6-V8JKjEM7GNwF_lruiS2qRM")
  }


  private parseAIResponse(responseContent: string): { message: string } {
    try {
      return JSON.parse(responseContent);
    } catch (error) {
      return { message: responseContent.trim().replace(/^AI:\s*/, '') };
    }
  }

  private resetState() {
    this.chatHistory = [];
    this.userDetails.name = '';
    this.userDetails.phone = '';
    this.date = '';
    this.specialtyId = '';
    this.shift = '';
  }


  async processMessage(input: string) {
    const farewellKeywords = ['bye', 'goodbye', 'see you', 'later', 'farewell', 'take care'];
    const greetingKeywords = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'];

    //REGEX
    const specialtyRegex = /Specialty can be:\s*(.*?)(\.|\n|$)/;
    const nameRegex = /My name is ([a-zA-Z\s]+)/;
    const phoneRegex = /\b\d{10}\b/;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
    const dateRegex = /\b(\d{4}-\d{2}-\d{2})\b/;
    const Shiftregex = /\d{2}:\d{2} - \d{2}:\d{2}/g;

    if (greetingKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
      this.resetState();
    }

    if (farewellKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
      this.resetState();
      return {
        message: 'Goodbye! It was a pleasure to assist you!',
      };
    }

    if (this.chatHistory.some(msg => msg.content.includes("Have a good day!"))) {
      this.resetState();
    }

    if (this.specialtiesData.length === 0) {
      this.specialtiesData = await this.specialtiesService.findAllName();
    }

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `
        You are a helpful assistant in health.
        Say greetings first. Then ask how you can help.
        You can only ask one question at a time and give examples for them.
        Ask and wait for them to answer.
        After 1 question, you conclude with a possible disease diagnosis, severity level, and temporary home precautions.
        Then from the list of ${this.specialtiesData}, predict which specialty the patient is in, just in the list above and only one specialty. 
        Next Answer" "Specialty can be: **speciaty predict**."
        Finally, ask them Would you like to make an appointment?.
        - If the user agrees, ask: "What is your name? Format: My name is [your name]."
        - Once the user provides their name, ask: "What is your phone number? [only 10 numbers]."
        - If the user declines, answer: "Have a good day!".
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
        const specialtyMatch = response.content.match(specialtyRegex);

        if (specialtyMatch) {
          let specialty = specialtyMatch[1].trim();
          specialty = specialty.replace(/\*\*/g, '').trim();
          if (!this.specialtyId) {
            this.specialtyId = await this.specialtiesService.findByName(specialty)
            const dateSchedule = await this.filterService.filterDoctorSchedulesBySpecialty({ specialtyId: this.specialtyId });
            const uniqueDates = [...new Set(dateSchedule.map(schedule => schedule.date.toISOString().split('T')[0]))];
            this.dateList = uniqueDates
          }
        } else {
          const responseMessage = "No specific specialty found after 'Specialty can be:'";
          this.chatHistory.push(new AIMessage({ content: responseMessage }));
          return { message: responseMessage };
        }
      }


      //collect user information
      if (input.includes('My name is')) {
        const nameMatch = input.match(nameRegex);

        if (!nameMatch || !nameMatch[1]) {
          const response = 'Invalid input format. Please enter your name correctly after "My name is".'
          this.chatHistory.push(new AIMessage({ content: response }))
        }
        const fullName = nameMatch[1].trim();
        this.userDetails.name = fullName;
        const response = `Thank you, ${fullName}. What is your phone number? (Enter 10 digits only).`
        this.chatHistory.push(new AIMessage({ content: response }));
        return { message: response }
      }

      const phoneMatch = input.match(phoneRegex);
      if (phoneMatch) {
        const phoneNumber = phoneMatch[0].trim();
        this.userDetails.phone = phoneNumber;
        const existingUser = await this.userAuthService.checkPhoneExists(phoneNumber);
        if (existingUser) {
          const response = `Phone number already exists. Please use a different phone number.`
          this.chatHistory.push(new AIMessage({ content: response }))
        }

        const response = `Thank you, ${this.userDetails.name}. What is your email?`;
        this.chatHistory.push(new AIMessage({ content: response }));
        return {
          message: response,
        };
      }

      const emailMatch = input.match(emailRegex);
      if (emailMatch) {
        if (!emailMatch) {
          const response = 'Invalid email format. Please enter a valid email address after "My email is".'
          this.chatHistory.push(new AIMessage({ content: response }));
        }
        const email = emailMatch[0].trim();
        this.userDetails.email = email;

        // const createUserAuthDto: CreateUserAuthDto = {
        //   fullName: this.userDetails.name,
        //   phoneNumber: this.userDetails.phone,
        //   password: this.userDetails.phone,
        //   email,
        //   roleId: new Types.ObjectId('673d931c35e97c832bfa6351'),
        // };
        // const user = await this.userAuthService.register(createUserAuthDto);
        // const patient = await this.patientsService.findPatientByUserId(user._id);
        // this.patientId = patient;
        // console.log('this.patientId', this.patientId);

        const response = `Thank you, ${this.userDetails.name}. I created an account for you with a phone and password is your phone number. \nWhat date would you like to schedule your appointment?\n.${this.dateList}`;
        this.chatHistory.push(new AIMessage({ content: response }));
        return { message: response, dateList: this.dateList };
      }


      // if (phoneMatch) {
      //   const response = `What date would you like to schedule your appointment?`;
      //   this.chatHistory.push(new AIMessage({ content: response }));
      //   return { message: response, dateList: this.dateList };
      // }

      //collect date
      const dateMatch = input.match(dateRegex);
      if (dateMatch) {
        const appointmentDate = dateMatch[1];
        if (!this.date) {
          this.date = appointmentDate;
        }
        // Lọc các lịch làm việc của bác sĩ theo chuyên khoa và ngày
        const schedule = await this.filterService.filterDoctorSchedulesBySpecialty({
          specialtyId: this.specialtyId,
          date: this.date,
          status: 'active'
        });

        if (schedule.length === 0) {
          const response = `We couldn't find any suitable schedule for ${this.date}. Please try another date.`;
          this.chatHistory.push(new AIMessage({ content: response }));
          return { message: response };
        }

        const shiftList = schedule.map(shift => shift.shift).join(', ');

        const response = `Your appointment has been scheduled for ${this.date}. The available shifts are: ${shiftList}. Please choose a shift.`;
        this.chatHistory.push(new AIMessage({ content: response }));
        this.shift = shiftList
        console.log(this.shift, shiftList);

        return { message: response, shiftList: shiftList };
      }

      //collect shift
      const ShiftMatch = input.match(Shiftregex);
      if (ShiftMatch) {
        console.log('shift');

        const shiftDate = ShiftMatch[0];
        if (!this.shift) {
          this.shift = shiftDate;
        }

        const schedule = await this.filterService.filterDoctorSchedulesBySpecialty({
          specialtyId: this.specialtyId,
          date: this.date,
          status: 'active',
          shift: this.shift
        });
        console.log(schedule);

        const scheduleId = schedule[0]._id;
        const doctorId = schedule[0].doctorId;
        console.log('scheduleId,doctorId,this.patientId', scheduleId, doctorId, this.patientId);
        if (!scheduleId || !doctorId || !this.patientId) {
          this.patientsService.remove(this.patientId.toString())
        }

        const createAppointmentDto: CreateAppointmentDto = {
          patientId: this.patientId,
          doctorScheduleId: scheduleId,
          doctorId: doctorId,
        };

        await this.appointmentsService.create(createAppointmentDto)

        const response = `Your appointment has been scheduled for ${this.date} and ${this.shift}. Have a good day!`;
        this.chatHistory.push(new AIMessage({ content: response }));
        return { message: response };
      }

      return jsonResponse;
    } catch (error) {
      console.error('Error processing message:', error);
      return { message: 'Sorry, there was an error processing your request. Please try again later.' };
    }

  }

  async chatWithAI(chatDTO: ChatDTO) {
    const pc = new Pinecone({
      apiKey: "pcsk_6B2zbn_68sJ4fEuQE5U5amWME5LFjPG15B71T7UsBSztRdm8ratCPQPvim2NSacPJWYjg7"
    });
    const index = pc.Index('chatbot');

    try {
      // Tạo embedding từ tin nhắn người dùng
      const queryEmbedding = await this.createEmbedding(chatDTO.message);

      // Tìm kiếm kết quả từ Pinecone để lấy ngữ cảnh chat trước đó (nếu có)
      const searchResults = await index.query({
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true,
      });

      // Tạo ngữ cảnh từ kết quả tìm kiếm
      const context = searchResults.matches.map(match => match.metadata?.content).join('\n');

      // Gọi phương thức processMessage để xử lý lời nhắn người dùng và lịch sử trò chuyện
      const processedResponse = await this.processMessage(chatDTO.message);

      // Trả về kết quả từ processMessage kết hợp với ngữ cảnh tìm được từ Pinecone
      return {
        message: processedResponse.message,
        context,
        dateList: this.dateList || [],
        shiftList: this.shift.toString(),
      };
    } catch (error) {
      console.error('Error in chatWithAI:', error);
      return { message: 'Sorry, there was an error processing your request. Please try again later.' };
    }
  }


  async createEmbedding(text: string): Promise<number[]> {
    const model = this.genAI.getGenerativeModel({ model: "text-embedding-004" })
    const response = await model.embedContent(text)
    return response.embedding.values.slice(0, 384);
  }

}
