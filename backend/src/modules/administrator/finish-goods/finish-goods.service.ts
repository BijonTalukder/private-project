import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFinishGoodsDto, UpdateFinishGoodsDto } from 'src/lib/dtos/finish-goods.dto';
import { FinishGoods } from 'src/lib/schemas/finish-goods.schema';


@Injectable()
export class FinishGoodsService {
    constructor(
        @InjectModel(FinishGoods.name)
        private finishGoodsModel: Model<FinishGoods>,
    ) { }

    /**
     * Create new finish goods
     */
    async create(dto: CreateFinishGoodsDto) {
        // Check if articleNo already exists
        const existingArticle = await this.finishGoodsModel.findOne({
            articleNo: dto.articleNo,
        });
        if (existingArticle) {
            throw new ConflictException('Article number already exists');
        }

        // Validate ObjectIds
        if (!Types.ObjectId.isValid(dto.colorId)) {
            throw new BadRequestException('Invalid color ID');
        }
        if (!Types.ObjectId.isValid(dto.unitId)) {
            throw new BadRequestException('Invalid unit ID');
        }
        if (!Types.ObjectId.isValid(dto.gsmId)) {
            throw new BadRequestException('Invalid GSM ID');
        }

        const finishGoods = await this.finishGoodsModel.create(dto);

        // Return with populated references
        return this.finishGoodsModel
            .findById(finishGoods._id)
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name');
    }

    /**
     * Get all finish goods with populated references
     */
    async findAll() {
        return this.finishGoodsModel
            .find()
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name')
            .sort({ createdAt: -1 });
    }

    /**
     * Get active finish goods only
     */
    async findActive() {
        return this.finishGoodsModel
            .find({ isActive: true })
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name')
            .sort({ articleNo: 1 });
    }

    /**
     * Get single finish goods by ID
     */
    async findOne(id: string) {
        const item = await this.finishGoodsModel
            .findById(id)
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name');

        if (!item) {
            throw new NotFoundException('Finish goods not found');
        }
        return item;
    }

    /**
     * Update finish goods
     */
    async update(id: string, dto: UpdateFinishGoodsDto) {
        const item = await this.finishGoodsModel.findById(id);
        if (!item) {
            throw new NotFoundException('Finish goods not found');
        }

        // Check articleNo uniqueness if updating
        if (dto.articleNo && dto.articleNo !== item.articleNo) {
            const existing = await this.finishGoodsModel.findOne({
                articleNo: dto.articleNo,
            });
            if (existing) {
                throw new ConflictException('Article number already exists');
            }
        }

        // Validate ObjectIds if provided
        if (dto.colorId && !Types.ObjectId.isValid(dto.colorId)) {
            throw new BadRequestException('Invalid color ID');
        }
        if (dto.unitId && !Types.ObjectId.isValid(dto.unitId)) {
            throw new BadRequestException('Invalid unit ID');
        }
        if (dto.gsmId && !Types.ObjectId.isValid(dto.gsmId)) {
            throw new BadRequestException('Invalid GSM ID');
        }

        const updated = await this.finishGoodsModel
            .findByIdAndUpdate(id, dto, { new: true })
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name');

        return updated;
    }

    /**
     * Delete finish goods
     */
    async delete(id: string) {
        const item = await this.finishGoodsModel.findById(id);
        if (!item) {
            throw new NotFoundException('Finish goods not found');
        }

        await this.finishGoodsModel.findByIdAndDelete(id);
        return { message: 'Finish goods deleted successfully' };
    }

    /**
     * Toggle active status
     */
    async toggleStatus(id: string) {
        const item = await this.finishGoodsModel.findById(id);
        if (!item) {
            throw new NotFoundException('Finish goods not found');
        }

        item.isActive = !item.isActive;
        await item.save();

        return this.finishGoodsModel
            .findById(id)
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name');
    }

    /**
     * Search by article number
     */
    async searchByArticleNo(query: string) {
        return this.finishGoodsModel
            .find({
                articleNo: { $regex: query, $options: 'i' },
            })
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name');
    }

    /**
     * Get finish goods by color
     */
    async findByColor(colorId: string) {
        return this.finishGoodsModel
            .find({ colorId: new Types.ObjectId(colorId), isActive: true })
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name');
    }

    /**
     * Get finish goods by GSM
     */
    async findByGSM(gsmId: string) {
        return this.finishGoodsModel
            .find({ gsmId: new Types.ObjectId(gsmId), isActive: true })
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name');
    }
}