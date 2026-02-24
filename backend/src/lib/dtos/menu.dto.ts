import { IsString, IsOptional, IsMongoId, IsNumber, Min } from 'class-validator';

export class CreateMenuDto {
    @IsString()
    name: string;

    @IsString()
    key: string;

    @IsOptional()
    @IsMongoId()
    parent?: string | null;

    @IsOptional()
    @IsNumber()
    @Min(0)
    level?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    order?: number;
}

export class UpdateMenuDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    key?: string;

    @IsOptional()
    @IsMongoId()
    parent?: string | null;

    @IsOptional()
    @IsNumber()
    @Min(0)
    level?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    order?: number;
}