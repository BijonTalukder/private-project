import {
    IsBoolean,
    IsMongoId,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

export class CreateFinishGoodsDto {
    @IsString()
    @MinLength(3)
    articleNo: string;

    @IsMongoId()
    colorId: string;
    @IsMongoId()
    widthId: string;

    @IsMongoId()
    unitId: string;

    @IsMongoId()
    gsmId: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateFinishGoodsDto {
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
    widthId: string;

    @IsOptional()
    @IsMongoId()
    gsmId?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}