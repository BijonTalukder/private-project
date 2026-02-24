import {
    IsString,
    IsMongoId,
    IsDateString,
    IsNumber,
    IsOptional,
    IsBoolean,
    Min,
    ValidateNested,
    IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

// Delivery Item DTO
export class DeliveryChallanItemDto {
    @IsMongoId()
    invoiceItemId: string; // Which invoice item

    @IsNumber()
    @Min(0.01)
    deliveryQty: number; // How much to deliver
}

// Create Challan DTO
export class CreateDeliveryChallanDto {
    @IsString()
    challanNo: string;

    @IsMongoId()
    invoiceId: string;

    @IsDateString()
    challanDate: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DeliveryChallanItemDto)
    items: DeliveryChallanItemDto[];

    @IsOptional()
    @IsString()
    remarks?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

// Update Challan DTO
export class UpdateDeliveryChallanDto {
    @IsOptional()
    @IsString()
    challanNo?: string;

    @IsOptional()
    @IsDateString()
    challanDate?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DeliveryChallanItemDto)
    items?: DeliveryChallanItemDto[];

    @IsOptional()
    @IsString()
    remarks?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}