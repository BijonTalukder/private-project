import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUnitDto {
    @IsString()
    @MinLength(1)
    name: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateUnitDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    name?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}