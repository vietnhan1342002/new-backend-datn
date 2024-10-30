import { IsNotEmpty } from "class-validator";

export class CreateDepartmentDto {
    @IsNotEmpty({ message: "departmentName không được để trống" })
    departmentName: string;

    @IsNotEmpty({ message: "description không được để trống" })
    description: string;
}
