import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto, UpdateUnitDto } from 'src/lib/dtos/unit.dto';

@Controller('admin/units')
export class UnitController {
    constructor(private readonly unitService: UnitService) { }

    @Post("create")
    create(@Body() dto: CreateUnitDto) {
        return this.unitService.create(dto);
    }

    @Get("all")
    findAll() {
        return this.unitService.findAll();
    }

    @Get('active')
    findActive() {
        return this.unitService.findActive();
    }

    @Get('single/:id')
    findOne(@Param('id') id: string) {
        return this.unitService.findOne(id);
    }

    @Patch('update/:id')
    update(@Param('id') id: string, @Body() dto: UpdateUnitDto) {
        return this.unitService.update(id, dto);
    }

    @Delete('delete/:id')
    delete(@Param('id') id: string) {
        return this.unitService.delete(id);
    }

    @Patch(':id/toggle-status')
    toggleStatus(@Param('id') id: string) {
        return this.unitService.toggleStatus(id);
    }
}