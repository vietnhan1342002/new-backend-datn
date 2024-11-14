import { PartialType } from '@nestjs/mapped-types';
import { CreateDepartmentDto } from './create-department.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {
  @IsNotEmpty({ message: 'departmentName cannot be empty' })
  departmentName?: string;

  @IsNotEmpty({ message: 'description cannot be empty' })
  description?: string;
}
