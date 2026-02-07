import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { RoleService } from "./role.service";
import { CreateRoleDto, UpdateRoleDto } from "src/lib/dtos/role.dto";

@Controller("admin/roles")
export class RoleController {
    constructor(
        private readonly roleService: RoleService
    ) { }
    @Post('create')
    async createRole(@Body() dto: CreateRoleDto) {
        return this.roleService.createRole(dto);
    }

    @Get('all')
    async getAllRoles() {
        return this.roleService.findAllRoles();
    }

    @Get('single/:id')
    async getRoleById(@Param('id') id: string) {
        return this.roleService.findRoleById(id);
    }

    @Patch('update/:id')
    async updateRole(
        @Param('id') id: string,
        @Body() dto: UpdateRoleDto,
    ) {
        return this.roleService.updateRole(id, dto);
    }

    @Delete('delete/:id')
    async deleteRole(@Param('id') id: string) {
        return this.roleService.deleteRole(id);
    }
}