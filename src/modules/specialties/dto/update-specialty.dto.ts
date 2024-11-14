import { PartialType } from '@nestjs/mapped-types';
import { CreateSpecialtyDto } from './create-specialty.dto';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class UpdateSpecialtyDto extends PartialType(CreateSpecialtyDto) {
  @IsNotEmpty({ message: 'name cannot be empty' })
  name: string;

  @IsNotEmpty({ message: 'departmentId cannot be empty' })
  @IsMongoId({ message: 'departmentId invalid' })
  departmentId: string;

  @IsNotEmpty({ message: 'description cannot be empty' })
  description: {
    introduction: string;
    qualifications: string[];
    relatedDiseases: string[];
  };
}
