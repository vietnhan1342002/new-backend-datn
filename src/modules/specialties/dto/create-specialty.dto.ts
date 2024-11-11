import { IsNotEmpty } from 'class-validator';

export class CreateSpecialtyDto {
  @IsNotEmpty({ message: 'name không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'description không được để trống' })
  description: {
    introduction: string;
    qualifications: string[];
    relatedDiseases: string[];
  };
}
