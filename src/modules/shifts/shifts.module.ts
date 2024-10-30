import { Module } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { ShiftsController } from './shifts.controller';
import { Shift, ShiftSchema } from './schemas/shift.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: Shift.name, schema: ShiftSchema }])],
  controllers: [ShiftsController],
  providers: [ShiftsService],
})
export class ShiftsModule {}
