import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConvertAmountDto, ConvertAmountResponse, CreateCurrencyConversionDto, UpdateCurrencyConversionDto } from 'src/lib/dtos/currency-conversion.dto';
import { CurrencyConversion } from 'src/lib/schemas/currency-conversion';


@Injectable()
export class CurrencyConversionService {
    constructor(
        @InjectModel(CurrencyConversion.name)
        private conversionModel: Model<CurrencyConversion>
    ) { }

    // Get all conversion rates
    async findAll(): Promise<CurrencyConversion[]> {
        return this.conversionModel
            .find()
            .populate('fromCurrencyId', 'currencyId name type')
            .populate('toCurrencyId', 'currencyId name type')
            .sort({ effectiveDate: -1, createdAt: -1 })
            .exec();
    }

    // Get active conversion rates only
    async findActive(): Promise<CurrencyConversion[]> {
        return this.conversionModel
            .find({ isActive: true })
            .populate('fromCurrencyId', 'currencyId name type')
            .populate('toCurrencyId', 'currencyId name type')
            .sort({ effectiveDate: -1 })
            .exec();
    }

    // Get conversion rate by ID
    async findOne(id: string): Promise<CurrencyConversion> {
        const conversion = await this.conversionModel
            .findById(id)
            .populate('fromCurrencyId', 'currencyId name type')
            .populate('toCurrencyId', 'currencyId name type')
            .exec();

        if (!conversion) {
            throw new NotFoundException('Conversion rate not found');
        }

        return conversion;
    }

    // Get conversion rate between two currencies
    async getConversionRate(fromCurrencyId: string, toCurrencyId: string): Promise<CurrencyConversion | null> {
        // If same currency, return null (no conversion needed)
        if (fromCurrencyId === toCurrencyId) {
            return null;
        }

        // Try direct conversion
        const directConversion = await this.conversionModel
            .findOne({
                fromCurrencyId,
                toCurrencyId,
                isActive: true
            })
            .populate('fromCurrencyId', 'currencyId name type')
            .populate('toCurrencyId', 'currencyId name type')
            .sort({ effectiveDate: -1 })
            .exec();

        if (directConversion) {
            return directConversion;
        }

        // Try reverse conversion (if USD to BDT not found, try BDT to USD and invert)
        const reverseConversion = await this.conversionModel
            .findOne({
                fromCurrencyId: toCurrencyId,
                toCurrencyId: fromCurrencyId,
                isActive: true
            })
            .populate('fromCurrencyId', 'currencyId name type')
            .populate('toCurrencyId', 'currencyId name type')
            .sort({ effectiveDate: -1 })
            .exec();

        if (reverseConversion) {
            // Create inverted conversion object
            return {
                ...reverseConversion.toObject(),
                fromCurrencyId: reverseConversion.toCurrencyId,
                toCurrencyId: reverseConversion.fromCurrencyId,
                exchangeRate: 1 / reverseConversion.exchangeRate
            } as any;
        }

        throw new NotFoundException(
            `No active conversion rate found between these currencies`
        );
    }

    // Convert amount between currencies
    async convertAmount(dto: ConvertAmountDto): Promise<ConvertAmountResponse> {
        const { amount, fromCurrencyId, toCurrencyId } = dto;

        // If same currency, return original amount
        if (fromCurrencyId === toCurrencyId) {
            const currency = await this.conversionModel.db.collection('currencyinfos').findOne({ _id: new Types.ObjectId(fromCurrencyId) });
            return {
                originalAmount: amount,
                convertedAmount: amount,
                fromCurrency: currency?.name,
                toCurrency: currency?.name,
                exchangeRate: 1,
                conversionDate: new Date()
            };
        }

        const conversion = await this.getConversionRate(fromCurrencyId, toCurrencyId);

        if (!conversion) {
            throw new NotFoundException('Conversion rate not found');
        }

        const convertedAmount = amount * conversion.exchangeRate;

        return {
            originalAmount: amount,
            convertedAmount: parseFloat(convertedAmount.toFixed(2)),
            fromCurrency: (conversion.fromCurrencyId as any).name,
            toCurrency: (conversion.toCurrencyId as any).name,
            exchangeRate: conversion.exchangeRate,
            conversionDate: new Date()
        };
    }

    // Create new conversion rate
    async create(dto: CreateCurrencyConversionDto): Promise<CurrencyConversion> {
        // Validate that currencies are different
        console.log(dto)
        if (dto.fromCurrencyId === dto.toCurrencyId) {
            throw new BadRequestException('Cannot create conversion rate for same currency');
        }

        // Check if active conversion already exists
        const existing = await this.conversionModel.findOne({
            fromCurrencyId: dto.fromCurrencyId,
            toCurrencyId: dto.toCurrencyId,
            isActive: true
        });

        if (existing) {
            throw new BadRequestException(
                'Active conversion rate already exists for this currency pair. Please deactivate it first.'
            );
        }

        const conversion = new this.conversionModel(dto);
        return conversion.save();
    }

    // Update conversion rate
    async update(id: string, dto: UpdateCurrencyConversionDto): Promise<CurrencyConversion> {
        const conversion = await this.conversionModel
            .findByIdAndUpdate(id, dto, { new: true })
            .populate('fromCurrencyId', 'currencyId name type')
            .populate('toCurrencyId', 'currencyId name type')
            .exec();

        if (!conversion) {
            throw new NotFoundException('Conversion rate not found');
        }

        return conversion;
    }

    // Delete conversion rate
    async delete(id: string): Promise<CurrencyConversion> {
        const conversion = await this.conversionModel.findByIdAndDelete(id).exec();

        if (!conversion) {
            throw new NotFoundException('Conversion rate not found');
        }

        return conversion;
    }

    // Toggle active status
    async toggleStatus(id: string): Promise<CurrencyConversion> {
        const conversion = await this.conversionModel.findById(id);

        if (!conversion) {
            throw new NotFoundException('Conversion rate not found');
        }

        conversion.isActive = !conversion.isActive;
        return conversion.save();
    }

    // Bulk convert amounts (useful for invoice items)
    async bulkConvert(
        amounts: number[],
        fromCurrencyId: string,
        toCurrencyId: string
    ): Promise<number[]> {
        if (fromCurrencyId === toCurrencyId) {
            return amounts;
        }

        const conversion = await this.getConversionRate(fromCurrencyId, toCurrencyId);

        if (!conversion) {
            throw new NotFoundException('Conversion rate not found');
        }

        return amounts.map(amount =>
            parseFloat((amount * conversion.exchangeRate).toFixed(2))
        );
    }
}