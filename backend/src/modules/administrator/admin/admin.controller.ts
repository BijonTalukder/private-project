import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { CreateAdminDto, UpdateAdminDto } from "src/lib/dtos/admin.dto";

@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService
    ) { }


    @Post('create')
    async createAdmin(@Body() dto: CreateAdminDto) {
        return this.adminService.createAdmin(dto);
    }
    @Get('all')
    async getAllAdmins() {
        return this.adminService.findAllAdmins();
    }
    @Get('single/:id')
    async getAdminById(@Param('id') id: string) {
        return this.adminService.findAdminById(id);
    }
    @Patch('update/:id')
    async updateAdmin(
        @Param('id') id: string,
        @Body() dto: UpdateAdminDto,
    ) {
        return this.adminService.updateAdmin(id, dto);
    }

    @Delete('delete/:id')
    async deleteAdmin(@Param('id') id: string) {
        return this.adminService.deleteAdmin(id);
    }

    @Patch(':id/toggle-status')
    async toggleAdminStatus(@Param('id') id: string) {
        return this.adminService.toggleAdminStatus(id);
    }

}