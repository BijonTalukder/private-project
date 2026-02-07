import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUnitDto, UpdateUnitDto } from 'src/lib/dtos/unit.dto';
import { Unit } from 'src/lib/schemas/unit.schema';


@Injectable()
export class UnitService {
    constructor(
        @InjectModel(Unit.name) private unitModel: Model<Unit>,
    ) { }

    async create(dto: CreateUnitDto) {
        const existing = await this.unitModel.findOne({ name: dto.name });
        if (existing) {
            throw new ConflictException('Unit name already exists');
        }

        return this.unitModel.create(dto);
    }

    async findAll() {
        return this.unitModel.find().sort({ createdAt: -1 });
    }

    async findActive() {
        return this.unitModel.find({ isActive: true }).sort({ name: 1 });
    }

    async findOne(id: string) {
        const unit = await this.unitModel.findById(id);
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }
        return unit;
    }

    async update(id: string, dto: UpdateUnitDto) {
        const unit = await this.unitModel.findById(id);
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }

        if (dto.name && dto.name !== unit.name) {
            const existing = await this.unitModel.findOne({ name: dto.name });
            if (existing) {
                throw new ConflictException('Unit name already exists');
            }
        }

        return this.unitModel.findByIdAndUpdate(id, dto, { new: true });
    }

    async delete(id: string) {
        const unit = await this.unitModel.findById(id);
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }

        await this.unitModel.findByIdAndDelete(id);
        return { message: 'Unit deleted successfully' };
    }

    async toggleStatus(id: string) {
        const unit = await this.unitModel.findById(id);
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }

        unit.isActive = !unit.isActive;
        await unit.save();
        return unit;
    }
}