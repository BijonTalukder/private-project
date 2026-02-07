import {
    IsArray,
    IsBoolean,
    IsEmail,
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    MinLength,
} from 'class-validator';

export class CreateAdminDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;



    @IsMongoId()
    role: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
export class UpdateAdminDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @IsOptional()
    @IsMongoId()
    role?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}