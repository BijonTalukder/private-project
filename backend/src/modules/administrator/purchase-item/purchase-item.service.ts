import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePurchaseItemInfoDto, UpdatePurchaseItemInfoDto } from 'src/lib/dtos/purchase-item-info.dto';
import { PurchaseItemInfo } from 'src/lib/schemas/purchase-item.schema';

@Injectable()
export class PurchaseItemInfoService {
    constructor(
        @InjectModel(PurchaseItemInfo.name)
        private purchaseItemInfoModel: Model<PurchaseItemInfo>,
    ) { }


    async create(dto: CreatePurchaseItemInfoDto) {

        const existingArticle = await this.purchaseItemInfoModel.findOne({
            articleNo: dto.articleNo,
        });
        if (existingArticle) {
            throw new ConflictException('Article number already exists');
        }


        if (!Types.ObjectId.isValid(dto.colorId)) {
            throw new BadRequestException('Invalid color ID');
        }
        if (!Types.ObjectId.isValid(dto.unitId)) {
            throw new BadRequestException('Invalid unit ID');
        }
        if (!Types.ObjectId.isValid(dto.gsmId)) {
            throw new BadRequestException('Invalid GSM ID');
        }

        const purchaseItem = await this.purchaseItemInfoModel.create(dto);


        return this.purchaseItemInfoModel
            .findById(purchaseItem._id)
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name');
    }


    async findAll() {
        return this.purchaseItemInfoModel
            .find()
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name')
            .sort({ createdAt: -1 });
    }


    async findActive() {
        return this.purchaseItemInfoModel
            .find({ isActive: true })
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name')
            .sort({ articleNo: 1 });
    }


    async findSameAsFinishGood() {
        return this.purchaseItemInfoModel
            .find({ isSameAsFinishGood: true, isActive: true })
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name')
            .sort({ articleNo: 1 });
    }

    async findOne(id: string) {
        const item = await this.purchaseItemInfoModel
            .findById(id)
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name');

        if (!item) {
            throw new NotFoundException('Purchase item info not found');
        }
        return item;
    }


    async update(id: string, dto: UpdatePurchaseItemInfoDto) {
        const item = await this.purchaseItemInfoModel.findById(id);
        if (!item) {
            throw new NotFoundException('Purchase item info not found');
        }


        if (dto.articleNo && dto.articleNo !== item.articleNo) {
            const existing = await this.purchaseItemInfoModel.findOne({
                articleNo: dto.articleNo,
            });
            if (existing) {
                throw new ConflictException('Article number already exists');
            }
        }


        if (dto.colorId && !Types.ObjectId.isValid(dto.colorId)) {
            throw new BadRequestException('Invalid color ID');
        }
        if (dto.unitId && !Types.ObjectId.isValid(dto.unitId)) {
            throw new BadRequestException('Invalid unit ID');
        }
        if (dto.gsmId && !Types.ObjectId.isValid(dto.gsmId)) {
            throw new BadRequestException('Invalid GSM ID');
        }

        const updated = await this.purchaseItemInfoModel
            .findByIdAndUpdate(id, dto, { new: true })
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name');

        return updated;
    }


    async delete(id: string) {
        const item = await this.purchaseItemInfoModel.findById(id);
        if (!item) {
            throw new NotFoundException('Purchase item info not found');
        }

        await this.purchaseItemInfoModel.findByIdAndDelete(id);
        return { message: 'Purchase item info deleted successfully' };
    }


    async toggleStatus(id: string) {
        const item = await this.purchaseItemInfoModel.findById(id);
        if (!item) {
            throw new NotFoundException('Purchase item info not found');
        }

        item.isActive = !item.isActive;
        await item.save();

        return this.purchaseItemInfoModel
            .findById(id)
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name');
    }


    async toggleSameAsFinishGood(id: string) {
        const item = await this.purchaseItemInfoModel.findById(id);
        if (!item) {
            throw new NotFoundException('Purchase item info not found');
        }

        item.isSameAsFinishGood = !item.isSameAsFinishGood;
        await item.save();

        return this.purchaseItemInfoModel
            .findById(id)
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name');
    }


    async searchByArticleNo(query: string) {
        return this.purchaseItemInfoModel
            .find({
                articleNo: { $regex: query, $options: 'i' },
            })
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('gsmId', 'gsmId name');
    }
}