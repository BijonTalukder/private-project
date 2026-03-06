import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Patch,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { CurrencyConversionService } from './currency-conversion.service';
import { ConvertAmountDto, CreateCurrencyConversionDto, UpdateCurrencyConversionDto } from 'src/lib/dtos/currency-conversion.dto';


@Controller('admin/currency-conversion')
export class CurrencyConversionController {
    constructor(
        private readonly conversionService: CurrencyConversionService
    ) { }

    // Get all conversion rates
    @Get("all")
    async findAll() {
        return this.conversionService.findAll();
    }

    // Get active conversion rates only
    @Get('active')
    async findActive() {
        return this.conversionService.findActive();
    }

    // Get conversion rate between two currencies
    @Get('rate')
    async getRate(
        @Query('from') fromCurrencyId: string,
        @Query('to') toCurrencyId: string
    ) {
        return this.conversionService.getConversionRate(fromCurrencyId, toCurrencyId);
    }

    // Get conversion by ID
    @Get('single/:id')
    async findOne(@Param('id') id: string) {
        return this.conversionService.findOne(id);
    }

    // Convert amount between currencies
    @Post('convert')
    @HttpCode(HttpStatus.OK)
    async convertAmount(@Body() dto: ConvertAmountDto) {
        return this.conversionService.convertAmount(dto);
    }

    // Bulk convert amounts
    @Post('bulk-convert')
    @HttpCode(HttpStatus.OK)
    async bulkConvert(
        @Body() body: {
            amounts: number[];
            fromCurrencyId: string;
            toCurrencyId: string;
        }
    ) {
        const { amounts, fromCurrencyId, toCurrencyId } = body;
        return this.conversionService.bulkConvert(
            amounts,
            fromCurrencyId,
            toCurrencyId
        );
    }

    // Create new conversion rate
    @Post()
    async create(@Body() dto: CreateCurrencyConversionDto) {
        console.log("controller lavel dto", dto)
        return this.conversionService.create(dto);
    }

    // Update conversion rate
    @Put('update/:id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateCurrencyConversionDto
    ) {
        return this.conversionService.update(id, dto);
    }

    // Delete conversion rate
    @Delete('delete/:id')
    async delete(@Param('id') id: string) {
        return this.conversionService.delete(id);
    }

    // Toggle active status
    @Patch(':id/toggle')
    async toggleStatus(@Param('id') id: string) {
        return this.conversionService.toggleStatus(id);
    }
}