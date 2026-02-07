import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateWidthDto, UpdateWidthDto } from "src/lib/dtos/width.dto";
import { Width } from "src/lib/schemas/width.schema";

@Injectable()
export class WidthService {
    constructor(@InjectModel(Width.name) private widthModel: Model<Width>) { }

    async create(dto: CreateWidthDto) {
        const existing = await this.widthModel.findOne({ name: dto.name });
        if (existing) {
            throw new ConflictException('Width name already exists');
        }

        return this.widthModel.create(dto);
    }

    async findAll() {
        return this.widthModel.find().sort({ createdAt: -1 });
    }

    async findActive() {
        return this.widthModel.find({ isActive: true }).sort({ name: 1 });
    }

    async findOne(id: string) {
        const width = await this.widthModel.findById(id);
        if (!width) {
            throw new NotFoundException('Width not found');
        }
        return width;
    }

    async update(id: string, dto: UpdateWidthDto) {
        const width = await this.widthModel.findById(id);
        if (!width) {
            throw new NotFoundException('Width not found');
        }

        if (dto.name && dto.name !== width.name) {
            const existing = await this.widthModel.findOne({ name: dto.name });
            if (existing) {
                throw new ConflictException('Width name already exists');
            }
        }

        return this.widthModel.findByIdAndUpdate(id, dto, { new: true });
    }

    async delete(id: string) {
        const width = await this.widthModel.findById(id);
        if (!width) {
            throw new NotFoundException('Width not found');
        }

        await this.widthModel.findByIdAndDelete(id);
        return { message: 'Width deleted successfully' };
    }

    async toggleStatus(id: string) {
        const width = await this.widthModel.findById(id);
        if (!width) {
            throw new NotFoundException('Width not found');
        }

        width.isActive = !width.isActive;
        await width.save();
        return width;
    }
}