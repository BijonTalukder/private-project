import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { BankInfoService } from './bank-info.service';
import { CreateBankInfoDto, UpdateBankInfoDto } from 'src/lib/dtos/bank-info.dto';


@Controller('admin/bank-info')
export class BankInfoController {
    constructor(private readonly bankInfoService: BankInfoService) { }

    @Post("create")
    create(@Body() dto: CreateBankInfoDto) {
        return this.bankInfoService.create(dto);
    }

    @Get("all")
    findAll() {
        return this.bankInfoService.findAll();
    }

    @Get('active')
    findActive() {
        return this.bankInfoService.findActive();
    }

    @Get('by-district')
    findByDistrict(@Query('district') district: string) {
        return this.bankInfoService.findByDistrict(district);
    }

    @Get('single/:id')
    findOne(@Param('id') id: string) {
        return this.bankInfoService.findOne(id);
    }

    @Patch('update/:id')
    update(@Param('id') id: string, @Body() dto: UpdateBankInfoDto) {
        return this.bankInfoService.update(id, dto);
    }

    @Delete('delete/:id')
    delete(@Param('id') id: string) {
        return this.bankInfoService.delete(id);
    }

    @Patch(':id/toggle-status')
    toggleStatus(@Param('id') id: string) {
        return this.bankInfoService.toggleStatus(id);
    }
}