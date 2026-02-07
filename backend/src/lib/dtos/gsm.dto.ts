import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateGSMDto {
    @IsString()
    @MinLength(1)
    name: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateGSMDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    name?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}