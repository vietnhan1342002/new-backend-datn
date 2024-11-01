import { Department } from '@/modules/departments/schemas/department.schema';
import { Role } from '@/modules/roles/schemas/role.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type UserAuthDocument = HydratedDocument<UserAuth>;

@Schema()
export class UserAuth extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: Role.name,
    default: new Types.ObjectId('67244680e47e013129b68d3a'),
  })
  roleId: Types.ObjectId; // Liên kết người dùng với Role

  @Prop()
  fullName: string;

  @Prop()
  phoneNumber: string;

  @Prop({ type: Types.ObjectId, ref: Department.name })
  departmentID: Types.ObjectId; // Liên kết người dùng với Department
}

export const UserAuthSchema = SchemaFactory.createForClass(UserAuth);
