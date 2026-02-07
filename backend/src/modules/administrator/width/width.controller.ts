import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { WidthService } from "./width.service";
import { CreateWidthDto, UpdateWidthDto } from "src/lib/dtos/width.dto";

@Controller("admin/widths")
export class WidthController {
    constructor(private readonly widthService: WidthService) { }
    @Post("create")
    create(@Body() dto: CreateWidthDto) {
        return this.widthService.create(dto);
    }

    @Get("all")
    findAll() {
        return this.widthService.findAll();
    }

    @Get('active')
    findActive() {
        return this.widthService.findActive();
    }

    @Get('single/:id')
    findOne(@Param('id') id: string) {
        return this.widthService.findOne(id);
    }

    @Patch('update/:id')
    update(@Param('id') id: string, @Body() dto: UpdateWidthDto) {
        return this.widthService.update(id, dto);
    }

    @Delete('delete/:id')
    delete(@Param('id') id: string) {
        return this.widthService.delete(id);
    }

    @Patch(':id/toggle-status')
    toggleStatus(@Param('id') id: string) {
        return this.widthService.toggleStatus(id);
    }
}