import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ClientService } from "./client.service";
import { CreateClientDto, UpdateClientDto } from "src/lib/dtos/client.dto";

@Controller("admin/clients")
export class ClientController {
    constructor(private readonly clientService: ClientService) { }
    @Post("create")
    async create(@Body() dto: CreateClientDto) {
        return this.clientService.create(dto);
    }

    @Get("all")
    async findAll() {
        return this.clientService.findAll();
    }

    @Get('active')
    async findActive() {
        return this.clientService.findActive();
    }

    @Get('search')
    async search(@Query('q') query: string) {
        return this.clientService.search(query);
    }

    @Get('single/:id')
    async findOne(@Param('id') id: string) {
        return this.clientService.findOne(id);
    }

    @Patch('update/:id')
    async update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
        return this.clientService.update(id, dto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.clientService.delete(id);
    }

    @Patch(':id/toggle-status')
    async toggleStatus(@Param('id') id: string) {
        return this.clientService.toggleStatus(id);
    }
}