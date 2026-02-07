import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateColorDto, UpdateColorDto } from "src/lib/dtos/color.dto";
import { Color } from "src/lib/schemas/color.schema";

@Injectable()
export class ColorService {
    constructor(
        @InjectModel(Color.name)
        private readonly colorModel: Model<Color>
    ) {

    }

    async create(dto: CreateColorDto) {
        const existing = await this.colorModel.findOne({ name: dto.name });
        if (existing) {
            throw new ConflictException('Color name already exists');
        }

        return this.colorModel.create(dto);
    }

    async findAll() {
        return this.colorModel.find().sort({ createdAt: -1 });
    }

    async findActive() {
        return this.colorModel.find({ isActive: true }).sort({ name: 1 });
    }

    async findOne(id: string) {
        const color = await this.colorModel.findById(id);
        if (!color) {
            throw new NotFoundException('Color not found');
        }
        return color;
    }

    async update(id: string, dto: UpdateColorDto) {
        const color = await this.colorModel.findById(id);
        if (!color) {
            throw new NotFoundException('Color not found');
        }

        if (dto.name && dto.name !== color.name) {
            const existing = await this.colorModel.findOne({ name: dto.name });
            if (existing) {
                throw new ConflictException('Color name already exists');
            }
        }

        return this.colorModel.findByIdAndUpdate(id, dto, { new: true });
    }

    async delete(id: string) {
        const color = await this.colorModel.findById(id);
        if (!color) {
            throw new NotFoundException('Color not found');
        }

        await this.colorModel.findByIdAndDelete(id);
        return { message: 'Color deleted successfully' };
    }

    async toggleStatus(id: string) {
        const color = await this.colorModel.findById(id);
        if (!color) {
            throw new NotFoundException('Color not found');
        }

        color.isActive = !color.isActive;
        await color.save();
        return color;
    }


}