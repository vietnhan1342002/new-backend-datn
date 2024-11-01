import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Department } from './schemas/department.schema';
import { Model, Types } from 'mongoose';
import { isExistHelper } from '@/helpers/utils';
import aqp from 'api-query-params';
import { UserAuth } from '../user-auth/schemas/user-auth.schema';
import { UserAuthService } from '../user-auth/user-auth.service';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name)
    private departmentModel: Model<Department>,

    // @InjectModel(UserAuth.name)
    // private userAuthModel: Model<UserAuth>,
    private userAuthService: UserAuthService,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const { departmentName, description } = createDepartmentDto;

    const departmentExists = await isExistHelper(
      { departmentName },
      this.departmentModel,
    );

    if (departmentExists) {
      throw new BadRequestException(
        `Phòng : ${departmentName} Đã tồn tại. Vui lòng đặt tên khác!`,
      );
    }

    const department = await this.departmentModel.create({
      departmentName,
      description,
    });
    return { _id: department.id };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.departmentModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * pageSize;

    const result = await this.departmentModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);

    if (result.length === 0) throw new NotFoundException('Không có phòng nào');

    return { result, totalPages };
  }

  async findOne(id: string) {
    const result = await this.departmentModel
      .findById({ _id: id })
      .select('departmentName description');
    if (!result) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return result;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const { departmentName, description } = updateDepartmentDto;
    return await this.departmentModel.updateOne(
      { _id: id },
      { departmentName, description },
    );
  }

  async remove(id: number) {
    const result = await this.departmentModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { message: `Department with ID ${id} deleted successfully` };
  }

  async getUsersByDepartment(id: string) {
    const department = await this.findOne(id);
    if (!department) {
      throw new NotFoundException('Không có phòng này');
    }

    console.log(
      await this.userAuthService.findByDepartment(department._id.toString()),
    );

    // const users = await this.userAuthModel
    //   .find({ departmentID: departmentId._id })
    //   .populate({
    //     path: 'departmentID',
    //     select: 'departmentName',
    //   }) // Populate để lấy thông tin của `Department`
    //   .select('fullName email departmentID')
    //   .exec();

    // if (!users || users.length === 0) {
    //   throw new NotFoundException('Không có nhân viên nào trong phòng ban này');
    // }
    // return users;
  }
}
