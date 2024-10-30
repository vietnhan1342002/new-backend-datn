import { Injectable } from '@nestjs/common';
import { CreateAppointmetDto } from './dto/create-appointmet.dto';
import { UpdateAppointmetDto } from './dto/update-appointmet.dto';

@Injectable()
export class AppointmetsService {
  create(createAppointmetDto: CreateAppointmetDto) {
    return 'This action adds a new appointmet';
  }

  findAll() {
    return `This action returns all appointmets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} appointmet`;
  }

  update(id: number, updateAppointmetDto: UpdateAppointmetDto) {
    return `This action updates a #${id} appointmet`;
  }

  remove(id: number) {
    return `This action removes a #${id} appointmet`;
  }
}
