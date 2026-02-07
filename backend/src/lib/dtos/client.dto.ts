import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class CreateClientDto {
    @IsString()
    @MinLength(2)
    name: string;

    @IsString()
    @MinLength(5)
    address: string;

    @IsString()
    @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid contact number format' })
    contactNo: string;

    @IsString()
    @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid personal contact number format' })
    personalContactNo: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateClientDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(5)
    address?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid contact number format' })
    contactNo?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid personal contact number format' })
    personalContactNo?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}