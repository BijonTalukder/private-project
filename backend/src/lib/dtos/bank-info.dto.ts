import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBankInfoDto {
    @IsString()
    @MinLength(2)
    name: string;

    @IsString()
    @MinLength(2)
    accountName: string;

    @IsString()
    @MinLength(2)
    branchName: string;

    @IsString()
    @MinLength(2)
    districtName: string;

    @IsString()
    @MinLength(2)
    code: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateBankInfoDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    accountName?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    branchName?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    districtName?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    code?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}