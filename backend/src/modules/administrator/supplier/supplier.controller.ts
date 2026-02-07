import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { SupplierService } from "./supplier.service";
import { CreateSupplierDto, UpdateSupplierDto } from "src/lib/dtos/supplier.dto";

@Controller("admin/suppliers")
export class SupplierController {
    constructor(
        private readonly supplierService: SupplierService
    ) { }

    @Post("create")
    async create(@Body() dto: CreateSupplierDto) {
        return this.supplierService.create(dto);
    }
    @Get("all")
    async findAll() {
        return this.supplierService.findAll();
    }

    @Get('active')
    async findActive() {
        return this.supplierService.findActive();
    }
    @Get('single/:id')
    async findOne(@Param('id') id: string) {
        return this.supplierService.findOne(id);
    }

    @Patch('update/:id')
    async update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
        return this.supplierService.update(id, dto);
    }

    @Delete('delete/:id')
    async delete(@Param('id') id: string) {
        return this.supplierService.delete(id);
    }

    @Patch(':id/toggle-status')
    async toggleStatus(@Param('id') id: string) {
        return this.supplierService.toggleStatus(id);
    }
}