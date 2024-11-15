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

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;
}

export const UserAuthSchema = SchemaFactory.createForClass(UserAuth);

UserAuthSchema.index({ email: 1 }, { unique: true });
UserAuthSchema.index({ phoneNumber: 1 }, { unique: true });
