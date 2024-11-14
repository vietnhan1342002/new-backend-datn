import { IsNotEmpty } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty({ message: 'departmentName cannot be empty' })
  departmentName: string;

  @IsNotEmpty({ message: 'description cannot be empty' })
  description: string;
}
