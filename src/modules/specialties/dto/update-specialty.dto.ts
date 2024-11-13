import { PartialType } from '@nestjs/mapped-types';
import { CreateSpecialtyDto } from './create-specialty.dto';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class UpdateSpecialtyDto extends PartialType(CreateSpecialtyDto) {
  @IsNotEmpty({ message: 'name không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'departmentId không được để trống' })
  @IsMongoId({ message: 'departmentId không hợp lệ' })
  departmentId: string;

  @IsNotEmpty({ message: 'description không được để trống' })
  description: {
    introduction: string;
    qualifications: string[];
    relatedDiseases: string[];
  };
}
