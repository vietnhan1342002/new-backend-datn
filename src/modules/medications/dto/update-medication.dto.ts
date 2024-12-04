import { IsString, IsOptional, IsInt, Min, IsPositive } from 'class-validator';

export class UpdateMedicationDto {
    @IsString()
    @IsOptional()
    name?: string; // Tên thuốc, không bắt buộc

    @IsString()
    @IsOptional()
    description?: string; // Mô tả thuốc, không bắt buộc

    @IsString()
    @IsOptional()
    usageInstructions?: string; // Hướng dẫn sử dụng, không bắt buộc

    @IsString()
    @IsOptional()
    sideEffects?: string; // Tác dụng phụ, không bắt buộc

    @IsInt()
    @IsPositive()
    @IsOptional()
    quantity?: number; // Số lượng thuốc trong kho, không bắt buộc, nếu có phải > 0

    @IsInt()
    @Min(0)
    @IsOptional()
    minQuantity?: number; // Mức cảnh báo tồn kho tối thiểu, không bắt buộc, nếu có phải >= 0

    @IsInt()
    @IsPositive()
    @IsOptional()
    price?: number; // Giá thuốc, không bắt buộc, nếu có phải > 0

    @IsString()
    @IsOptional()
    unit?: string; // Đơn vị thuốc, không bắt buộc
}
