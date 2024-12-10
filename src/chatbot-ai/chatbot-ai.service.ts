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
  private dateList: string[] = [];
  private vectorStore;
  private patientId: string;
  private specialtyId: string;
  private date: string;
  private shift: string;

  constructor(
    private userAuthService: UserAuthService,
    private specialtiesService: SpecialtiesService,
    private filterService: FilterService,
    private patientsService: PatientsService,
    private appointmentsService: AppointmentsService,
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

  private resetState() {
    this.chatHistory = [];
    this.userDetails.name = '';
    this.userDetails.phone = '';
    this.date = '';
    this.patientId = '';
    this.specialtyId = '';
    this.shift = '';
  }


  async processMessage(input: string) {
    const farewellKeywords = ['bye', 'goodbye', 'see you', 'later', 'farewell', 'take care'];
    const greetingKeywords = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'];

    //REGEX
    const namePhoneRegex = /My name is ([A-Za-z\s]+), (\d{10}).?$/;
    const specialtyRegex = /Specialty can be:\s*(.*?)(\.|\n|$)/;
    const dateRegex = /\b(\d{4}-\d{2}-\d{2})\b/;
    const Shiftregex = /\d{2}:\d{2} - \d{2}:\d{2}/g;

    if (greetingKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
      this.resetState();
    }

    // Check if input contains the breakup keyword
    if (farewellKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
      this.resetState();
      return {
        message: 'Goodbye! The chat history has been cleared. Feel free to start a new conversation anytime!',
      };
    }

    // Check if input Have a good day
    if (this.chatHistory.some(msg => msg.content.includes("Have a good day!"))) {
      this.resetState();
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
        After 1 question, you conclude with a possible disease diagnosis, severity level, and temporary home precautions.
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
        const match = input.match(namePhoneRegex);

        if (match) {
          const fullName = (this.userDetails.name = match[1]);
          const phoneNumber = (this.userDetails.phone = match[2]).toString();
          const existingUser = await this.userAuthService.checkPhoneExists(phoneNumber);
          if (existingUser) {
            return { message: 'Phone number already exists. Please use a different phone number.' };
          }
          const createUserAuthDto: CreateUserAuthDto = {
            fullName,
            phoneNumber,
            password: phoneNumber,
            roleId: new Types.ObjectId('673d931c35e97c832bfa6351')
          };
          // const user = await this.userAuthService.register(createUserAuthDto);
          // const patient = await this.patientsService.findPatientByUserId(user._id)
          // this.patientId = patient.toString()
          const response = `I created an account for you with a phone and password is 123456.\nWhat date would you like to schedule your appointment?\n.${this.dateList}`;
          this.chatHistory.push(new AIMessage({ content: response }));
          return {
            message: response,
            dateList: this.dateList
            // _id: user._id
          };
        } else {
          return { message: 'Invalid input format. Please ensure your name and phone number are entered correctly.' };
        }
      }

      //collect date
      if (input.match(/My name is [A-Za-z\s]+, (\d{10})/)) {
        const response = `What date would you like to schedule your appointment?`;
        this.chatHistory.push(new AIMessage({ content: response }));
        return { message: response, dateList: this.dateList };
      }
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
        return { message: response, shiftList: shiftList };
      }

      //collect shift
      const ShiftMatch = input.match(Shiftregex);
      if (ShiftMatch) {
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
        const scheduleId = schedule[0]._id;
        const doctorId = schedule[0].doctorId;
        const createAppointmentDto: CreateAppointmentDto = {
          doctorScheduleId: scheduleId,
          doctorId: doctorId,
          patientId: new Types.ObjectId(this.patientId),
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

}
