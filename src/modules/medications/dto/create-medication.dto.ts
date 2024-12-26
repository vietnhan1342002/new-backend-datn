import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsPositive } from 'class-validator';

export class CreateMedicationDto {
    @IsString()
    @IsNotEmpty()
    name: string; 

    @IsString()
    @IsOptional()
    description?: string;
    @IsString()
    @IsOptional()
    usageInstructions?: string;

    @IsString()
    @IsOptional()
    sideEffects?: string;

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
