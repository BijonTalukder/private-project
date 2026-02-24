import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from 'src/lib/dtos/invoice.dto';

@Controller('admin/invoices')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    @Post("create")
    create(@Body() dto: CreateInvoiceDto) {
        return this.invoiceService.create(dto);
    }

    @Get("all")
    findAll() {
        return this.invoiceService.findAll();
    }

    @Get('by-client/:clientId')
    findByClient(@Param('clientId') clientId: string) {
        return this.invoiceService.findByClient(clientId);
    }

    @Get('single/:id')
    findOne(@Param('id') id: string) {
        return this.invoiceService.findOneAggregated(id);
    }

    @Patch('update/:id')
    update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
        return this.invoiceService.update(id, dto);
    }

    @Delete('delete/:id')
    delete(@Param('id') id: string) {
        return this.invoiceService.delete(id);
    }

    @Patch(':id/toggle-status')
    toggleStatus(@Param('id') id: string) {
        return this.invoiceService.toggleStatus(id);
    }
}