import {
    IsBoolean,
    IsMongoId,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

export class CreatePurchaseItemInfoDto {
    @IsString()
    @MinLength(3)
    articleNo: string;

    @IsMongoId()
    colorId: string;

    @IsMongoId()
    unitId: string;

    @IsMongoId()
    gsmId: string;

    @IsOptional()
    @IsBoolean()
    isSameAsFinishGood?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdatePurchaseItemInfoDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    articleNo?: string;

    @IsOptional()
    @IsMongoId()
    colorId?: string;

    @IsOptional()
    @IsMongoId()
    unitId?: string;

    @IsOptional()
    @IsMongoId()
    gsmId?: string;

    @IsOptional()
    @IsBoolean()
    isSameAsFinishGood?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}