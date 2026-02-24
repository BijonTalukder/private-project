import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBankInfoDto, UpdateBankInfoDto } from 'src/lib/dtos/bank-info.dto';
import { BankInfo } from 'src/lib/schemas/bank-info.schema';


@Injectable()
export class BankInfoService {
    constructor(
        @InjectModel(BankInfo.name)
        private bankModel: Model<BankInfo>,
    ) { }

    async create(dto: CreateBankInfoDto) {
        const existing = await this.bankModel.findOne({ code: dto.code });
        if (existing) throw new ConflictException('Bank code already exists');
        return this.bankModel.create(dto);
    }

    async findAll() {
        return this.bankModel.find().sort({ createdAt: -1 });
    }

    async findActive() {
        return this.bankModel.find({ isActive: true }).sort({ name: 1 });
    }

    async findByDistrict(districtName: string) {
        return this.bankModel
            .find({ districtName: { $regex: districtName, $options: 'i' }, isActive: true })
            .sort({ name: 1 });
    }

    async findOne(id: string) {
        const bank = await this.bankModel.findById(id);
        if (!bank) throw new NotFoundException('Bank info not found');
        return bank;
    }

    async update(id: string, dto: UpdateBankInfoDto) {
        const bank = await this.bankModel.findById(id);
        if (!bank) throw new NotFoundException('Bank info not found');

        if (dto.code && dto.code !== bank.code) {
            const existing = await this.bankModel.findOne({ code: dto.code });
            if (existing) throw new ConflictException('Bank code already exists');
        }

        return this.bankModel.findByIdAndUpdate(id, dto, { new: true });
    }

    async delete(id: string) {
        const bank = await this.bankModel.findById(id);
        if (!bank) throw new NotFoundException('Bank info not found');
        await this.bankModel.findByIdAndDelete(id);
        return { message: 'Bank info deleted successfully' };
    }

    async toggleStatus(id: string) {
        const bank = await this.bankModel.findById(id);
        if (!bank) throw new NotFoundException('Bank info not found');
        bank.isActive = !bank.isActive;
        await bank.save();
        return bank;
    }
}