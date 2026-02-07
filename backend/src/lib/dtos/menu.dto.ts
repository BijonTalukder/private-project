import { IsArray, IsMongoId, IsOptional, IsString, Matches, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';

export class CreateSubMenuDto {
    @IsString()
    name: string;

    @IsString()
    @Matches(/^[a-zA-Z0-9._-]+$/)
    key: string;
}

export class CreateMenuWithChildrenDto {
    @IsString()
    name: string;

    @IsString()
    @Matches(/^[a-zA-Z0-9._-]+$/)
    key: string;

    @IsMongoId()
    @IsOptional()
    parent?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSubMenuDto)
    children?: CreateSubMenuDto[];
}

export class CreateMenu {
    @IsString()
    name: string;

    @IsString()
    @Matches(/^[a-zA-Z0-9._-]+$/)
    key: string;

    @IsMongoId()
    @IsOptional()
    parent: string

}