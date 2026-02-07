import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateWidthDto {
    @IsString()
    @MinLength(1)
    name: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateWidthDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    name?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}