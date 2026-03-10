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
import { FinishGoodsService } from './finish-goods.service';
import { CreateFinishGoodsDto, UpdateFinishGoodsDto } from 'src/lib/dtos/finish-goods.dto';

@Controller('admin/finish-goods')
export class FinishGoodsController {
    constructor(
        private readonly finishGoodsService: FinishGoodsService,
    ) { }

    @Post("create")
    create(@Body() dto: CreateFinishGoodsDto) {
        return this.finishGoodsService.create(dto);
    }

    @Post("bulk-create")
    createMany(@Body() dto: CreateFinishGoodsDto[]) {
        return this.finishGoodsService.createMany(dto);
    }


    @Get("all")
    findAll() {
        return this.finishGoodsService.findAll();
    }

    @Get('active')
    findActive() {
        return this.finishGoodsService.findActive();
    }

    @Get('search')
    search(@Query('q') query: string) {
        return this.finishGoodsService.searchByArticleNo(query);
    }

    @Get('by-color/:colorId')
    findByColor(@Param('colorId') colorId: string) {
        return this.finishGoodsService.findByColor(colorId);
    }

    @Get('by-gsm/:gsmId')
    findByGSM(@Param('gsmId') gsmId: string) {
        return this.finishGoodsService.findByGSM(gsmId);
    }

    @Get('single/:id')
    findOne(@Param('id') id: string) {
        return this.finishGoodsService.findOne(id);
    }

    @Patch('update/:id')
    update(@Param('id') id: string, @Body() dto: UpdateFinishGoodsDto) {
        return this.finishGoodsService.update(id, dto);
    }

    @Delete('delete/:id')
    delete(@Param('id') id: string) {
        return this.finishGoodsService.delete(id);
    }

    @Patch(':id/toggle-status')
    toggleStatus(@Param('id') id: string) {
        return this.finishGoodsService.toggleStatus(id);
    }
}