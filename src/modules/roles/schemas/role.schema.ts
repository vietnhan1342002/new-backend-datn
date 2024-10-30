import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true })
export class Role {
    @Prop({ required: true })
    nameRole: string;  // Tên role, ví dụ: "admin", "user"

    @Prop()
    description: string[];  
}

export const RoleSchema = SchemaFactory.createForClass(Role);