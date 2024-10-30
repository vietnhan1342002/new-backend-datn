import { PartialType } from '@nestjs/mapped-types';
import { CreateDepartmentDto } from './create-department.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {
    @IsNotEmpty({ message: "departmentName không được để trống" })
    departmentName: string;

    @IsNotEmpty({ message: "description không được để trống" })
    description: string;
}
