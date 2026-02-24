import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { PaymentInfoService } from './payment-info.service';
import { CreatePaymentInfoDto, UpdatePaymentInfoDto } from 'src/lib/dtos/payment-info.dto';

@Controller('admin/payment-info')
export class PaymentInfoController {
    constructor(private readonly paymentInfoService: PaymentInfoService) { }

    @Post("create")
    create(@Body() dto: CreatePaymentInfoDto) {
        return this.paymentInfoService.create(dto);
    }

    @Get("all")
    findAll() {
        return this.paymentInfoService.findAll();
    }

    @Get('active')
    findActive() {
        return this.paymentInfoService.findActive();
    }

    @Get('single/:id')
    findOne(@Param('id') id: string) {
        return this.paymentInfoService.findOne(id);
    }

    @Patch('update/:id')
    update(@Param('id') id: string, @Body() dto: UpdatePaymentInfoDto) {
        return this.paymentInfoService.update(id, dto);
    }

    @Delete('delete/:id')
    delete(@Param('id') id: string) {
        return this.paymentInfoService.delete(id);
    }

    @Patch(':id/toggle-status')
    toggleStatus(@Param('id') id: string) {
        return this.paymentInfoService.toggleStatus(id);
    }
}