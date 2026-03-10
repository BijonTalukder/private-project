import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsMongoId, IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";

// Create DTO
export class CreateSupplierPurchasePriceListDto {
    @IsNotEmpty({ message: 'Supplier ID is required' })
    @IsMongoId({ message: 'Invalid supplier ID format' })
    supplierId: string;

    @IsNotEmpty({ message: 'Purchase item info ID is required' })
    @IsMongoId({ message: 'Invalid purchase item info ID format' })
    purchaseItemInfoId: string;

    @IsNotEmpty({ message: 'Currency ID is required' })
    @IsMongoId({ message: 'Invalid currency ID format' })
    currencyId: string;

    @IsNotEmpty({ message: 'Purchase rate is required' })
    @IsNumber({}, { message: 'Purchase rate must be a number' })
    @Min(0, { message: 'Purchase rate must be at least 0' })
    purchaseRate: number;

    @IsOptional()
    @IsNumber({}, { message: 'Commission must be a number' })
    @Min(0, { message: 'Commission must be at least 0' })
    commission?: number;

    @IsOptional()
    @IsBoolean({ message: 'isActive must be a boolean' })
    isActive?: boolean;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Close date must be a valid date' })
    closeDate?: Date | null;
}

// Update DTO
export class UpdateSupplierPurchasePriceListDto {
    @IsOptional()
    @IsMongoId({ message: 'Invalid supplier ID format' })
    supplierId?: string;

    @IsOptional()
    @IsMongoId({ message: 'Invalid purchase item info ID format' })
    purchaseItemInfoId?: string;

    @IsOptional()
    @IsMongoId({ message: 'Invalid currency ID format' })
    currencyId?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Purchase rate must be a number' })
    @Min(0, { message: 'Purchase rate must be at least 0' })
    purchaseRate?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Commission must be a number' })
    @Min(0, { message: 'Commission must be at least 0' })
    commission?: number;

    @IsOptional()
    @IsBoolean({ message: 'isActive must be a boolean' })
    isActive?: boolean;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Close date must be a valid date' })
    closeDate?: Date | null;
}

// Response DTO (with populated fields)
export interface SupplierPurchasePriceListResponse {
    _id: string;
    priceListId: string;
    supplierId: {
        _id: string;
        supplierId: string;
        supplierName: string;
        phone: string;
        contactPerson?: string;
    };
    purchaseItemInfoId: {
        _id: string;
        purchaseItemId: string;
        articleNo: string;
        colorId: {
            _id: string;
            name: string;
            type: string;
        };
        gsmId: {
            _id: string;
            name: string;
        };
        unitId: {
            _id: string;
            name: string;
        };
        finishGoodsId: string;
    };
    currencyId: {
        _id: string;
        currencyId: string;
        name: string;
        type: string;
    };
    purchaseRate: number;
    commission: number;
    isActive: boolean;
    closeDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}