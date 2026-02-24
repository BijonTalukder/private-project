import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query,
} from '@nestjs/common';
import { SupplierPurchasePriceListService } from './supplier-purchase-price-list.service';
import { CreateSupplierPurchasePriceListDto, UpdateSupplierPurchasePriceListDto } from 'src/lib/dtos/supplier-purchase-price-list.dto';

@Controller('admin/supplier-purchase-price-list')
export class SupplierPurchasePriceListController {
    constructor(private readonly service: SupplierPurchasePriceListService) { }

    @Post("create")
    create(@Body() dto: CreateSupplierPurchasePriceListDto) {
        return this.service.create(dto);
    }

    @Get("all")
    findAll() {
        return this.service.findAll();
    }

    @Get('active')
    findActive() {
        return this.service.findActive();
    }

    @Get('by-supplier/:supplierId')
    findBySupplier(@Param('supplierId') supplierId: string) {
        return this.service.findBySupplier(supplierId);
    }

    @Get('by-purchase-item/:purchaseItemInfoId')
    findByPurchaseItem(@Param('purchaseItemInfoId') id: string) {
        return this.service.findByPurchaseItem(id);
    }

    @Get('single/:id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch('update/:id')
    update(@Param('id') id: string, @Body() dto: UpdateSupplierPurchasePriceListDto) {
        return this.service.update(id, dto);
    }

    @Delete('delete/:id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }

    @Patch(':id/toggle-status')
    toggleStatus(@Param('id') id: string) {
        return this.service.toggleStatus(id);
    }

    @Patch(':id/set-close-date')
    setCloseDate(
        @Param('id') id: string,
        @Body('closeDate') closeDate: string | null,
    ) {
        return this.service.setCloseDate(id, closeDate);
    }
}