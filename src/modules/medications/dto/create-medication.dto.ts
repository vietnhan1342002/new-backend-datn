import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsPositive } from 'class-validator';

export class CreateMedicationDto {
    @IsString()
    @IsNotEmpty()
    name: string; // Tên thuốc, bắt buộc phải nhập

    @IsString()
    @IsOptional()
    description?: string; // Mô tả thuốc, không bắt buộc

    @IsString()
    @IsOptional()
    usageInstructions?: string; // Hướng dẫn sử dụng, không bắt buộc

    @IsString()
    @IsOptional()
    sideEffects?: string; // Tác dụng phụ, không bắt buộc

    @IsInt({ message: 'Quantity must be an integer' })
    @Min(1, { message: 'Quantity must be greater than or equal to 1' })
    quantity: number;

    @IsInt({ message: 'Minimum quantity must be an integer' })
    @Min(1, { message: 'Minimum quantity must be greater than or equal to 1' })
    minQuantity: number;

    @IsInt({ message: 'Price must be an integer' })
    @Min(0, { message: 'Price must be greater than or equal to 0' })
    price: number;

    @IsNotEmpty({ message: 'Unit must not be empty' })
    unit: string;
}
