import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGSMDto, UpdateGSMDto } from 'src/lib/dtos/gsm.dto';
import { GSM } from 'src/lib/schemas/gsm.schema';


@Injectable()
export class GSMService {
    constructor(
        @InjectModel(GSM.name) private gsmModel: Model<GSM>,
    ) { }

    async create(dto: CreateGSMDto) {
        const existing = await this.gsmModel.findOne({ name: dto.name });
        if (existing) {
            throw new ConflictException('GSM name already exists');
        }

        return this.gsmModel.create(dto);
    }

    async findAll() {
        return this.gsmModel.find().sort({ createdAt: -1 });
    }

    async findActive() {
        return this.gsmModel.find({ isActive: true }).sort({ name: 1 });
    }

    async findOne(id: string) {
        const gsm = await this.gsmModel.findById(id);
        if (!gsm) {
            throw new NotFoundException('GSM not found');
        }
        return gsm;
    }

    async update(id: string, dto: UpdateGSMDto) {
        const gsm = await this.gsmModel.findById(id);
        if (!gsm) {
            throw new NotFoundException('GSM not found');
        }

        if (dto.name && dto.name !== gsm.name) {
            const existing = await this.gsmModel.findOne({ name: dto.name });
            if (existing) {
                throw new ConflictException('GSM name already exists');
            }
        }

        return this.gsmModel.findByIdAndUpdate(id, dto, { new: true });
    }

    async delete(id: string) {
        const gsm = await this.gsmModel.findById(id);
        if (!gsm) {
            throw new NotFoundException('GSM not found');
        }

        await this.gsmModel.findByIdAndDelete(id);
        return { message: 'GSM deleted successfully' };
    }

    async toggleStatus(id: string) {
        const gsm = await this.gsmModel.findById(id);
        if (!gsm) {
            throw new NotFoundException('GSM not found');
        }

        gsm.isActive = !gsm.isActive;
        await gsm.save();
        return gsm;
    }
}