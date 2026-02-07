import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { MenuService } from "./menu.service";
import { CreateMenuWithChildrenDto } from "src/lib/dtos/menu.dto";

@Controller("admin/menu")
export class MenuController {
    constructor(

        private readonly menuService: MenuService
    ) { }
    @Post()
    create(@Body() body: CreateMenuWithChildrenDto) {
        return this.menuService.createWithChildren(body);
    }

    @Get('all')
    findAll() {
        return this.menuService.findAll();
    }
    @Get('single/:id')
    findOne(@Param('id') id: string) {
        return this.menuService.findOne(id);
    }
    @Patch('update/:id')
    update(@Param('id') id: string, @Body() body) {
        return this.menuService.update(id, body);
    }
    @Delete('delete/:id')
    delete(@Param('id') id: string) {
        return this.menuService.delete(id);
    }

}