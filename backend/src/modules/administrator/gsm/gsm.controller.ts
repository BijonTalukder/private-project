import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import { GSMService } from './gsm.service';
import { CreateGSMDto, UpdateGSMDto } from 'src/lib/dtos/gsm.dto';

@Controller('admin/gsm')
export class GSMController {
    constructor(private readonly gsmService: GSMService) { }

    @Post("create")
    create(@Body() dto: CreateGSMDto) {
        return this.gsmService.create(dto);
    }

    @Get("all")
    findAll() {
        return this.gsmService.findAll();
    }

    @Get('active')
    findActive() {
        return this.gsmService.findActive();
    }

    @Get('single/:id')
    findOne(@Param('id') id: string) {
        return this.gsmService.findOne(id);
    }

    @Patch('update/:id')
    update(@Param('id') id: string, @Body() dto: UpdateGSMDto) {
        return this.gsmService.update(id, dto);
    }

    @Delete('delete/:id')
    delete(@Param('id') id: string) {
        return this.gsmService.delete(id);
    }

    @Patch(':id/toggle-status')
    toggleStatus(@Param('id') id: string) {
        return this.gsmService.toggleStatus(id);
    }
}