import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";


export class PermissionDto {
    @IsMongoId()
    menuId: string;

    @IsString()
    menuName: string;

    @IsString()
    menuKey: string;

    @IsBoolean()
    create: boolean;

    @IsBoolean()
    read: boolean;

    @IsBoolean()
    update: boolean;

    @IsBoolean()
    delete: boolean;
}
export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PermissionDto)
    permissions: PermissionDto[];
}

export class UpdateRoleDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PermissionDto)
    permissions?: PermissionDto[];
}