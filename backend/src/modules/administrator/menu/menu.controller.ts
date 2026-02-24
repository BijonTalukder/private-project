import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto } from 'src/lib/dtos/menu.dto';


@Controller('admin/menus')
export class MenuController {
    constructor(private readonly menuService: MenuService) { }

    @Post()
    create(@Body() dto: CreateMenuDto) {
        return this.menuService.create(dto);
    }

    @Get("all")
    findAllNested() {
        return this.menuService.findAllNested();
    }

    @Get('single/:id')
    findOne(@Param('id') id: string) {
        return this.menuService.findOne(id);
    }

    @Get(':id/children')
    findChildren(@Param('id') id: string) {
        return this.menuService.findChildren(id);
    }

    @Patch('update/:id')
    update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
        return this.menuService.update(id, dto);
    }

    @Delete('delete/:id')
    delete(@Param('id') id: string) {
        return this.menuService.delete(id);
    }

    @Post('reorder')
    reorder(@Body() items: { id: string; order: number }[]) {
        return this.menuService.reorder(items);
    }
}