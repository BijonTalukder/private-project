import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CreateColorDto, UpdateColorDto } from "src/lib/dtos/color.dto";
import { ColorService } from "./color.service";

@Controller("admin/colors")
export class ColorController {
    constructor(
        private readonly colorService: ColorService
    ) { }

    @Post("create")
    create(@Body() dto: CreateColorDto) {
        return this.colorService.create(dto);
    }

    @Get("all")
    findAll() {
        return this.colorService.findAll();
    }

    @Get('active')
    findActive() {
        return this.colorService.findActive();
    }

    @Get('single/:id')
    findOne(@Param('id') id: string) {
        return this.colorService.findOne(id);
    }

    @Patch('update/:id')
    update(@Param('id') id: string, @Body() dto: UpdateColorDto) {
        return this.colorService.update(id, dto);
    }

    @Delete('delete/:id')
    delete(@Param('id') id: string) {
        return this.colorService.delete(id);
    }

    @Patch(':id/toggle-status')
    toggleStatus(@Param('id') id: string) {
        return this.colorService.toggleStatus(id);
    }
}