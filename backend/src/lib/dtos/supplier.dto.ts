import {
    IsBoolean,
    IsEmail,
    IsOptional,
    IsString,
    Matches,
    MinLength,
} from 'class-validator';

export class CreateSupplierDto {
    @IsString()
    @MinLength(2)
    supplierName: string;

    @IsOptional()
    @IsString()
    supplierCode?: string;

    @IsString()
    @MinLength(2)
    contactPerson: string;

    @IsString()
    @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' })
    phone: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    gstNumber?: string;

    @IsOptional()
    @IsString()
    tinNumber?: string;

    @IsOptional()
    @IsString()
    licenseNumber?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateSupplierDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    supplierName?: string;

    @IsOptional()
    @IsString()
    supplierCode?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    contactPerson?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' })
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    gstNumber?: string;

    @IsOptional()
    @IsString()
    tinNumber?: string;

    @IsOptional()
    @IsString()
    licenseNumber?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}