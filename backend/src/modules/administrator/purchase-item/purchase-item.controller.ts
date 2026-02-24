import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
} from '@nestjs/common';
import { PurchaseItemInfoService } from './purchase-item.service';
import { CreatePurchaseItemInfoDto, UpdatePurchaseItemInfoDto } from 'src/lib/dtos/purchase-item-info.dto';

@Controller('admin/purchase-item-info')
export class PurchaseItemInfoController {
    constructor(
        private readonly purchaseItemInfoService: PurchaseItemInfoService,
    ) { }

    @Post("create")
    create(@Body() dto: CreatePurchaseItemInfoDto) {
        return this.purchaseItemInfoService.create(dto);
    }

    @Get("all")
    findAll() {
        return this.purchaseItemInfoService.findAll();
    }

    @Get('active')
    findActive() {
        return this.purchaseItemInfoService.findActive();
    }

    @Get('same-as-finish-good')
    findSameAsFinishGood() {
        return this.purchaseItemInfoService.findSameAsFinishGood();
    }

    @Get('search')
    search(@Query('q') query: string) {
        return this.purchaseItemInfoService.searchByArticleNo(query);
    }

    @Get('single/:id')
    findOne(@Param('id') id: string) {
        return this.purchaseItemInfoService.findOne(id);
    }

    @Patch('update/:id')
    update(@Param('id') id: string, @Body() dto: UpdatePurchaseItemInfoDto) {
        return this.purchaseItemInfoService.update(id, dto);
    }

    @Delete('delete/:id')
    delete(@Param('id') id: string) {
        return this.purchaseItemInfoService.delete(id);
    }

    @Patch(':id/toggle-status')
    toggleStatus(@Param('id') id: string) {
        return this.purchaseItemInfoService.toggleStatus(id);
    }

    @Patch(':id/toggle-same-as-finish-good')
    toggleSameAsFinishGood(@Param('id') id: string) {
        return this.purchaseItemInfoService.toggleSameAsFinishGood(id);
    }
}