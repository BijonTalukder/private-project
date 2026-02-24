import {
    IsBoolean,
    IsDateString,
    IsMongoId,
    IsNumber,
    IsOptional,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSupplierPurchasePriceListDto {
    @IsMongoId()
    supplierId: string;

    @IsMongoId()
    purchaseItemInfoId: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    purchaseRate: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsDateString()
    closeDate?: string | null;
}

export class UpdateSupplierPurchasePriceListDto {
    @IsOptional()
    @IsMongoId()
    supplierId?: string;

    @IsOptional()
    @IsMongoId()
    purchaseItemInfoId?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    purchaseRate?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsDateString()
    closeDate?: string | null;
}