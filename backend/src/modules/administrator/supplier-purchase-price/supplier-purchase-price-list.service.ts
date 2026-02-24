import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateSupplierPurchasePriceListDto, UpdateSupplierPurchasePriceListDto } from 'src/lib/dtos/supplier-purchase-price-list.dto';
import { SupplierPurchasePriceList } from 'src/lib/schemas/supplier-purchase-price-list.schema';


@Injectable()
export class SupplierPurchasePriceListService {
    constructor(
        @InjectModel(SupplierPurchasePriceList.name)
        private priceListModel: Model<SupplierPurchasePriceList>,
    ) { }

    private populate(query: any) {
        return query
            .populate('supplierId', 'supplierId supplierName contactPerson phone')
            .populate({
                path: 'purchaseItemInfoId',
                select: 'purchaseItemId articleNo',
                populate: [
                    { path: 'colorId', select: 'colorId name type' },
                    { path: 'unitId', select: 'unitId name' },
                    { path: 'gsmId', select: 'gsmId name' },
                ],
            });
    }

    async create(dto: CreateSupplierPurchasePriceListDto) {
        if (!Types.ObjectId.isValid(dto.supplierId))
            throw new BadRequestException('Invalid supplier ID');
        if (!Types.ObjectId.isValid(dto.purchaseItemInfoId))
            throw new BadRequestException('Invalid purchase item info ID');

        const record = await this.priceListModel.create(dto);
        return this.populate(this.priceListModel.findById(record._id));
    }

    async findAll() {
        return this.populate(
            this.priceListModel.find().sort({ createdAt: -1 }),
        );
    }

    async findActive() {
        return this.populate(
            this.priceListModel
                .find({ isActive: true, $or: [{ closeDate: null }, { closeDate: { $gte: new Date() } }] })
                .sort({ createdAt: -1 }),
        );
    }

    async findBySupplier(supplierId: string) {
        return this.populate(
            this.priceListModel
                .find({ supplierId: new Types.ObjectId(supplierId) })
                .sort({ createdAt: -1 }),
        );
    }

    async findByPurchaseItem(purchaseItemInfoId: string) {
        return this.populate(
            this.priceListModel
                .find({ purchaseItemInfoId: new Types.ObjectId(purchaseItemInfoId) })
                .sort({ purchaseRate: 1 }),
        );
    }

    async findOne(id: string) {
        const record = await this.populate(this.priceListModel.findById(id));
        if (!record) throw new NotFoundException('Price list entry not found');
        return record;
    }

    async update(id: string, dto: UpdateSupplierPurchasePriceListDto) {
        const record = await this.priceListModel.findById(id);
        if (!record) throw new NotFoundException('Price list entry not found');

        if (dto.supplierId && !Types.ObjectId.isValid(dto.supplierId))
            throw new BadRequestException('Invalid supplier ID');
        if (dto.purchaseItemInfoId && !Types.ObjectId.isValid(dto.purchaseItemInfoId))
            throw new BadRequestException('Invalid purchase item info ID');

        return this.populate(
            this.priceListModel.findByIdAndUpdate(id, dto, { new: true }),
        );
    }

    async delete(id: string) {
        const record = await this.priceListModel.findById(id);
        if (!record) throw new NotFoundException('Price list entry not found');
        await this.priceListModel.findByIdAndDelete(id);
        return { message: 'Price list entry deleted successfully' };
    }

    async toggleStatus(id: string) {
        const record = await this.priceListModel.findById(id);
        if (!record) throw new NotFoundException('Price list entry not found');
        record.isActive = !record.isActive;
        await record.save();
        return this.populate(this.priceListModel.findById(id));
    }

    async setCloseDate(id: string, closeDate: string | null) {
        const record = await this.priceListModel.findById(id);
        if (!record) throw new NotFoundException('Price list entry not found');
        record.closeDate = closeDate ? new Date(closeDate) : null;
        if (closeDate && new Date(closeDate) <= new Date()) {
            record.isActive = false;
        }
        await record.save();
        return this.populate(this.priceListModel.findById(id));
    }
}