import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from './schemas/role.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}

  async create(createRoleDto: CreateRoleDto) {
    return this.roleModel.create(createRoleDto);
  }

  async findAll() {
    return this.roleModel.find();
  }

  // Tìm role bằng ObjectId
  async findRoleById(roleId: Types.ObjectId) {
    return this.roleModel.findById(roleId);
  }
}
