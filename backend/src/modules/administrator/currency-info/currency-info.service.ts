import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCurrencyInfoDto, UpdateCurrencyInfoDto } from 'src/lib/dtos/currency-info.dto';
import { CurrencyInfo } from 'src/lib/schemas/currency-info.schema';

@Injectable()
export class CurrencyInfoService {
    constructor(
        @InjectModel(CurrencyInfo.name)
        private currencyModel: Model<CurrencyInfo>,
    ) { }

    async create(dto: CreateCurrencyInfoDto) {
        const existing = await this.currencyModel.findOne({ name: dto.name });
        if (existing) throw new ConflictException('Currency name already exists');
        return this.currencyModel.create(dto);
    }

    async findAll() {
        return this.currencyModel.find().sort({ createdAt: -1 });
    }

    async findActive() {
        return this.currencyModel.find({ isActive: true }).sort({ name: 1 });
    }

    async findOne(id: string) {
        const currency = await this.currencyModel.findById(id);
        if (!currency) throw new NotFoundException('Currency not found');
        return currency;
    }

    async update(id: string, dto: UpdateCurrencyInfoDto) {
        const currency = await this.currencyModel.findById(id);
        if (!currency) throw new NotFoundException('Currency not found');

        if (dto.name && dto.name !== currency.name) {
            const existing = await this.currencyModel.findOne({ name: dto.name });
            if (existing) throw new ConflictException('Currency name already exists');
        }

        return this.currencyModel.findByIdAndUpdate(id, dto, { new: true });
    }

    async delete(id: string) {
        const currency = await this.currencyModel.findById(id);
        if (!currency) throw new NotFoundException('Currency not found');
        await this.currencyModel.findByIdAndDelete(id);
        return { message: 'Currency deleted successfully' };
    }

    async toggleStatus(id: string) {
        const currency = await this.currencyModel.findById(id);
        if (!currency) throw new NotFoundException('Currency not found');
        currency.isActive = !currency.isActive;
        await currency.save();
        return currency;
    }
}