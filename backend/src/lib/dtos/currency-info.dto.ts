import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCurrencyInfoDto {
    @IsString()
    @MinLength(2)
    name: string;

    @IsString()
    @MinLength(2)
    type: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateCurrencyInfoDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    type?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}