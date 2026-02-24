import {
    IsBoolean,
    IsMongoId,
    IsNumber,
    IsOptional,
    IsString,
    MinLength,
    Min,
    ValidateNested,
    IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

// ── Invoice Item DTO ───────────────────────────────────────────────────────
export class InvoiceItemDto {
    @IsMongoId()
    finishGoodsId: string;

    @IsMongoId()
    supplierPurchasePriceId: string;

    @IsNumber()
    @Min(0)
    invoiceQty: number;

    @IsNumber()
    @Min(0)
    unitPrice: number;

    @IsNumber()
    @Min(0)
    commission: number;

    @IsNumber()
    @Min(0)
    price: number;

    @IsNumber()
    @Min(0)
    amount: number;
}

// ── Create Invoice DTO ─────────────────────────────────────────────────────
export class CreateInvoiceDto {
    @IsString()
    @MinLength(3)
    invoiceNo: string;

    @IsMongoId()
    clientId: string;

    @IsMongoId()
    currencyId: string;

    @IsMongoId()
    paymentId: string;

    @IsMongoId()
    bankId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceItemDto)
    items: InvoiceItemDto[];

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

// ── Update Invoice DTO ─────────────────────────────────────────────────────
export class UpdateInvoiceDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    invoiceNo?: string;

    @IsOptional()
    @IsMongoId()
    clientId?: string;

    @IsOptional()
    @IsMongoId()
    currencyId?: string;

    @IsOptional()
    @IsMongoId()
    paymentId?: string;

    @IsOptional()
    @IsMongoId()
    bankId?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceItemDto)
    items?: InvoiceItemDto[];

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}