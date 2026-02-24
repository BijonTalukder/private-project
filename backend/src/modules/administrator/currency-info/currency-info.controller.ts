import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CurrencyInfoService } from './currency-info.service';
import { CreateCurrencyInfoDto, UpdateCurrencyInfoDto } from 'src/lib/dtos/currency-info.dto';

@Controller('admin/currency-info')
export class CurrencyInfoController {
    constructor(private readonly currencyInfoService: CurrencyInfoService) { }

    @Post("create")
    create(@Body() dto: CreateCurrencyInfoDto) {
        return this.currencyInfoService.create(dto);
    }

    @Get("all")
    findAll() {
        return this.currencyInfoService.findAll();
    }

    @Get('active')
    findActive() {
        return this.currencyInfoService.findActive();
    }

    @Get('single/:id')
    findOne(@Param('id') id: string) {
        return this.currencyInfoService.findOne(id);
    }

    @Patch('update/:id')
    update(@Param('id') id: string, @Body() dto: UpdateCurrencyInfoDto) {
        return this.currencyInfoService.update(id, dto);
    }

    @Delete('delete/:id')
    delete(@Param('id') id: string) {
        return this.currencyInfoService.delete(id);
    }

    @Patch(':id/toggle-status')
    toggleStatus(@Param('id') id: string) {
        return this.currencyInfoService.toggleStatus(id);
    }
}