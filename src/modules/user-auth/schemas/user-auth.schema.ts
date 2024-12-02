import { Role } from '@/modules/roles/schemas/role.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type UserAuthDocument = HydratedDocument<UserAuth>;

@Schema()
export class UserAuth extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: Role.name,
    default: new Types.ObjectId('673d935335e97c832bfa6356'),
  })
  roleId: Types.ObjectId; // Liên kết người dùng với Role

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phoneNumber: string;
}

export const UserAuthSchema = SchemaFactory.createForClass(UserAuth);

UserAuthSchema.index({ email: 1 }, { unique: true });
UserAuthSchema.index({ fullName: 1 }, { unique: true });
UserAuthSchema.index({ phoneNumber: 1 }, { unique: true });
