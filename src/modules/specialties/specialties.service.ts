import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Specialty } from './schemas/specialty.schema';
import { Model } from 'mongoose';
import { isExistHelper } from '@/helpers/utils';

@Injectable()
export class SpecialtiesService {
  constructor(
    @InjectModel(Specialty.name)
    private specialtyModel: Model<Specialty>,
  ) {}

  async create(createSpecialtyDto: CreateSpecialtyDto) {
    const { name, description } = createSpecialtyDto;

    const specialtyExists = await isExistHelper({ name }, this.specialtyModel);

    if (specialtyExists) {
      throw new BadRequestException(
        `Specialty : ${name} already exists. Please enter another name!`,
      );
    }

    const specialty = await this.specialtyModel.create({
      name,
      description,
    });
    return { _id: specialty.id };
  }

  findAll() {
    return `This action returns all specialties`;
  }

  findOne(id: number) {
    return `This action returns a #${id} specialty`;
  }

  update(id: number, updateSpecialtyDto: UpdateSpecialtyDto) {
    return `This action updates a #${id} specialty`;
  }

  remove(id: number) {
    return `This action removes a #${id} specialty`;
  }
}
