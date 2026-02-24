import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { DeliveryChallanService } from './delivery-challan.service';
import { CreateDeliveryChallanDto, UpdateDeliveryChallanDto } from 'src/lib/dtos/delivery-challan.dto';

@Controller('admin/delivery-challans')
export class DeliveryChallanController {
    constructor(private readonly service: DeliveryChallanService) { }

    @Post("create")
    create(@Body() dto: CreateDeliveryChallanDto) {
        return this.service.create(dto);
    }

    @Get("all")
    findAll() {
        return this.service.findAll();
    }

    @Get('invoice/:invoiceId/summary')
    getInvoiceDeliverySummary(@Param('invoiceId') invoiceId: string) {
        return this.service.getInvoiceDeliverySummary(invoiceId);
    }

    @Get('invoice/:invoiceId')
    findByInvoice(@Param('invoiceId') invoiceId: string) {
        return this.service.findByInvoice(invoiceId);
    }

    @Get('single/:id')
    findOne(@Param('id') id: string) {
        return this.service.findOneAggregated(id);
    }

    @Patch('update/:id')
    update(@Param('id') id: string, @Body() dto: UpdateDeliveryChallanDto) {
        return this.service.update(id, dto);
    }

    @Delete('delete/:id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }

    @Patch('toggle-status/:id')
    toggleStatus(@Param('id') id: string) {
        return this.service.toggleStatus(id);
    }
}