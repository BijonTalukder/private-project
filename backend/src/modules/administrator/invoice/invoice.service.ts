import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateInvoiceDto, UpdateInvoiceDto } from 'src/lib/dtos/invoice.dto';
import { InvoiceItem } from 'src/lib/schemas/invoice-item.schema';
import { Invoice } from 'src/lib/schemas/invoice.schema';


@Injectable()
export class InvoiceService {
    constructor(
        @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
        @InjectModel(InvoiceItem.name) private invoiceItemModel: Model<InvoiceItem>,
    ) { }

    /**
     * Create invoice with items
     */
    async create(dto: CreateInvoiceDto) {
        // Check invoice number uniqueness
        const existing = await this.invoiceModel.findOne({ invoiceNo: dto.invoiceNo });
        if (existing) throw new ConflictException('Invoice number already exists');
        if (dto.items.length === 0) throw new BadRequestException('Invoice must have at least one item');
        if (dto.items.some(item => item.invoiceQty <= 0 || item.unitPrice < 0 || item.amount < 0)) {
            throw new BadRequestException('Invalid item data: quantities and prices must be non-negative');
        }
        if (dto.items.some(item => !Types.ObjectId.isValid(item.finishGoodsId) || !Types.ObjectId.isValid(item.supplierPurchasePriceId))) {
            throw new BadRequestException('Invalid item data: finishGoodsId and supplierPurchasePriceId must be valid ObjectIds');
        }
        if (!Types.ObjectId.isValid(dto.clientId) || !Types.ObjectId.isValid(dto.currencyId) || !Types.ObjectId.isValid(dto.paymentId) || !Types.ObjectId.isValid(dto.bankId)) {
            throw new BadRequestException('Invalid invoice data: clientId, currencyId, paymentId, and bankId must be valid ObjectIds');
        }

        // Calculate totals from items
        const totalQty = dto.items.reduce((sum, item) => sum + item.invoiceQty, 0);
        const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);
        const totalCommissionAmount = dto.items.reduce((sum, item) => sum + item.commission, 0);

        // Create invoice
        const invoice = await this.invoiceModel.create({
            invoiceNo: dto.invoiceNo,
            clientId: new Types.ObjectId(dto.clientId),
            currencyId: new Types.ObjectId(dto.currencyId),
            paymentId: new Types.ObjectId(dto.paymentId),
            bankId: new Types.ObjectId(dto.bankId),
            totalQty,
            totalAmount,
            totalCommissionAmount,
            isActive: dto.isActive ?? true,
        });

        // Create invoice items
        const items = dto.items.map((item) => ({
            ...item,
            finishGoodsId: new Types.ObjectId(item.finishGoodsId),
            supplierPurchasePriceId: new Types.ObjectId(item.supplierPurchasePriceId),

            invoiceId: invoice._id,
        }));
        const res = await this.invoiceItemModel.insertMany(items);
        console.log("Inserted items:", res);

        // Return with aggregated data
        return this.findOneAggregated(invoice._id.toString());
    }

    /**
     * Find all invoices with aggregation
     */
    async findAll() {
        return this.invoiceModel.aggregate([
            { $sort: { createdAt: -1 } },

            // ── Header lookups ─────────────────────────────────────────────────────
            { $lookup: { from: 'clients', localField: 'clientId', foreignField: '_id', as: 'client' } },
            { $unwind: '$client' },
            { $lookup: { from: 'currencyinfos', localField: 'currencyId', foreignField: '_id', as: 'currency' } },
            { $unwind: '$currency' },
            { $lookup: { from: 'paymentinfos', localField: 'paymentId', foreignField: '_id', as: 'payment' } },
            { $unwind: '$payment' },
            { $lookup: { from: 'bankinfos', localField: 'bankId', foreignField: '_id', as: 'bank' } },
            { $unwind: '$bank' },

            // ── Invoice items ──────────────────────────────────────────────────────
            {
                $lookup: {
                    from: 'invoiceitems',
                    localField: '_id',
                    foreignField: 'invoiceId',
                    as: 'items',
                },
            },

            // ── Flat lookups for item sub-documents ────────────────────────────────
            {
                $lookup: {
                    from: 'finishgoods',
                    localField: 'items.finishGoodsId',
                    foreignField: '_id',
                    as: 'finishGoodsData',
                },
            },
            {
                $lookup: {
                    from: 'supplierpurchasepricelists',
                    localField: 'items.supplierPurchasePriceId',
                    foreignField: '_id',
                    as: 'priceListData',
                },
            },

            // ── ROOT CAUSE FIX ─────────────────────────────────────────────────────
            // finishGoodsData.colorId / unitId / gsmId / widthId are stored as plain
            // strings in the DB. $lookup compares them against ObjectId _id fields
            // and gets no match → colorData: [], unitData: [], etc.
            // Solution: add *IdObj helper fields converted via $toObjectId first.
            {
                $addFields: {
                    finishGoodsData: {
                        $map: {
                            input: '$finishGoodsData',
                            as: 'fg',
                            in: {
                                $mergeObjects: [
                                    '$$fg',
                                    {
                                        colorIdObj: { $toObjectId: '$$fg.colorId' },
                                        unitIdObj: { $toObjectId: '$$fg.unitId' },
                                        gsmIdObj: { $toObjectId: '$$fg.gsmId' },
                                        widthIdObj: { $toObjectId: '$$fg.widthId' },
                                    },
                                ],
                            },
                        },
                    },
                },
            },

            // ── Lookup using converted ObjectId fields ─────────────────────────────
            {
                $lookup: {
                    from: 'colors',
                    localField: 'finishGoodsData.colorIdObj',
                    foreignField: '_id',
                    as: 'colorData',
                },
            },
            {
                $lookup: {
                    from: 'units',
                    localField: 'finishGoodsData.unitIdObj',
                    foreignField: '_id',
                    as: 'unitData',
                },
            },
            {
                $lookup: {
                    from: 'gsms',
                    localField: 'finishGoodsData.gsmIdObj',
                    foreignField: '_id',
                    as: 'gsmData',
                },
            },
            {
                $lookup: {
                    from: 'widths',
                    localField: 'finishGoodsData.widthIdObj',
                    foreignField: '_id',
                    as: 'widthData',
                },
            },

            // ── Merge color/unit/gsm/width objects into each finishGood ───────────
            {
                $addFields: {
                    finishGoodsData: {
                        $map: {
                            input: '$finishGoodsData',
                            as: 'fg',
                            in: {
                                $mergeObjects: [
                                    '$$fg',
                                    {
                                        colorId: {
                                            $arrayElemAt: [
                                                { $filter: { input: '$colorData', cond: { $eq: ['$$this._id', '$$fg.colorIdObj'] } } },
                                                0,
                                            ],
                                        },
                                        unitId: {
                                            $arrayElemAt: [
                                                { $filter: { input: '$unitData', cond: { $eq: ['$$this._id', '$$fg.unitIdObj'] } } },
                                                0,
                                            ],
                                        },
                                        gsmId: {
                                            $arrayElemAt: [
                                                { $filter: { input: '$gsmData', cond: { $eq: ['$$this._id', '$$fg.gsmIdObj'] } } },
                                                0,
                                            ],
                                        },
                                        widthId: {
                                            $arrayElemAt: [
                                                { $filter: { input: '$widthData', cond: { $eq: ['$$this._id', '$$fg.widthIdObj'] } } },
                                                0,
                                            ],
                                        },
                                        // Remove helper fields from output
                                        colorIdObj: '$$REMOVE',
                                        unitIdObj: '$$REMOVE',
                                        gsmIdObj: '$$REMOVE',
                                        widthIdObj: '$$REMOVE',
                                    },
                                ],
                            },
                        },
                    },
                },
            },

            // ── Merge enriched finishGoods + priceList into each item ──────────────
            {
                $addFields: {
                    items: {
                        $map: {
                            input: '$items',
                            as: 'item',
                            in: {
                                $mergeObjects: [
                                    '$$item',
                                    {
                                        finishGoods: {
                                            $arrayElemAt: [
                                                { $filter: { input: '$finishGoodsData', cond: { $eq: ['$$this._id', '$$item.finishGoodsId'] } } },
                                                0,
                                            ],
                                        },
                                        priceList: {
                                            $arrayElemAt: [
                                                { $filter: { input: '$priceListData', cond: { $eq: ['$$this._id', '$$item.supplierPurchasePriceId'] } } },
                                                0,
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },

            // ── Clean up temp arrays ───────────────────────────────────────────────
            {
                $project: {
                    finishGoodsData: 0,
                    priceListData: 0,
                    colorData: 0,
                    unitData: 0,
                    gsmData: 0,
                    widthData: 0,
                },
            },
        ]);
    }

    /**
     * Find single invoice with full aggregation
     */
    async findOneAggregated(id: string) {
        if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid invoice ID');

        const result = await this.invoiceModel.aggregate([
            { $match: { _id: new Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'clients',
                    localField: 'clientId',
                    foreignField: '_id',
                    as: 'client',
                },
            },
            { $unwind: '$client' },
            {
                $lookup: {
                    from: 'currencyinfos',
                    localField: 'currencyId',
                    foreignField: '_id',
                    as: 'currency',
                },
            },
            { $unwind: '$currency' },
            {
                $lookup: {
                    from: 'paymentinfos',
                    localField: 'paymentId',
                    foreignField: '_id',
                    as: 'payment',
                },
            },
            { $unwind: '$payment' },
            {
                $lookup: {
                    from: 'bankinfos',
                    localField: 'bankId',
                    foreignField: '_id',
                    as: 'bank',
                },
            },
            { $unwind: '$bank' },
            {
                $lookup: {
                    from: 'invoiceitems',
                    localField: '_id',
                    foreignField: 'invoiceId',
                    as: 'items',
                },
            },
            {
                $lookup: {
                    from: 'finishgoods',
                    localField: 'items.finishGoodsId',
                    foreignField: '_id',
                    as: 'finishGoodsData',
                },
            },
            {
                $lookup: {
                    from: 'supplierpurchasepricelists',
                    localField: 'items.supplierPurchasePriceId',
                    foreignField: '_id',
                    as: 'priceListData',
                },
            },
            {
                $addFields: {
                    items: {
                        $map: {
                            input: '$items',
                            as: 'item',
                            in: {
                                $mergeObjects: [
                                    '$$item',
                                    {
                                        finishGoods: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$finishGoodsData',
                                                        cond: { $eq: ['$$this._id', '$$item.finishGoodsId'] },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                        priceList: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$priceListData',
                                                        cond: { $eq: ['$$this._id', '$$item.supplierPurchasePriceId'] },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            { $project: { finishGoodsData: 0, priceListData: 0 } },
        ]);
        if (!result || result.length === 0) throw new NotFoundException('Invoice not found');
        return result[0];
    }

    /**
     * Update invoice with items
     */
    async update(id: string, dto: UpdateInvoiceDto) {
        const invoice = await this.invoiceModel.findOne({
            _id: new Types.ObjectId(id),
        }).lean();


        if (!invoice) throw new NotFoundException('Invoice not found');

        // Check invoice number uniqueness
        if (dto.invoiceNo && dto.invoiceNo !== invoice.invoiceNo) {
            const existing = await this.invoiceModel.findOne({ invoiceNo: dto.invoiceNo });
            if (existing) throw new ConflictException('Invoice number already exists');
        }

        // If items provided, recalculate totals and update items
        if (dto.items) {
            const totalQty = dto.items.reduce((sum, item) => sum + item.invoiceQty, 0);
            const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);
            const totalCommissionAmount = dto.items.reduce((sum, item) => sum + item.commission, 0);

            // Delete old items
            await this.invoiceItemModel.deleteMany({ invoiceId: invoice._id });

            // Create new items
            const items = dto.items.map((item) => ({
                ...item,
                finishGoodsId: new Types.ObjectId(item.finishGoodsId),
                supplierPurchasePriceId: new Types.ObjectId(item.supplierPurchasePriceId),

                invoiceId: invoice._id,
            }));
            await this.invoiceItemModel.insertMany(items);

            // Update invoice with new totals
            await this.invoiceModel.findByIdAndUpdate(id, {
                ...dto,
                clientId: dto.clientId ? new Types.ObjectId(dto.clientId) : invoice.clientId,
                currencyId: dto.currencyId ? new Types.ObjectId(dto.currencyId) : invoice.currencyId,
                paymentId: dto.paymentId ? new Types.ObjectId(dto.paymentId) : invoice.paymentId,
                bankId: dto.bankId ? new Types.ObjectId(dto.bankId) : invoice.bankId,
                totalQty,
                totalAmount,
                totalCommissionAmount,
            });
        } else {
            // Update only invoice master data
            await this.invoiceModel.findByIdAndUpdate(id, {
                ...dto,
                clientId: dto.clientId ? new Types.ObjectId(dto.clientId) : invoice.clientId,
                currencyId: dto.currencyId ? new Types.ObjectId(dto.currencyId) : invoice.currencyId,
                paymentId: dto.paymentId ? new Types.ObjectId(dto.paymentId) : invoice.paymentId,
                bankId: dto.bankId ? new Types.ObjectId(dto.bankId) : invoice.bankId,
            });
        }
        return this.findOneAggregated(id);
    }

    /**
     * Delete invoice and its items
     */
    async delete(id: string) {
        const invoice = await this.invoiceModel.findById(id);
        if (!invoice) throw new NotFoundException('Invoice not found');

        // Delete items
        await this.invoiceItemModel.deleteMany({ invoiceId: invoice._id });

        // Delete invoice
        await this.invoiceModel.findByIdAndDelete(id);

        return { message: 'Invoice deleted successfully' };
    }

    /**
     * Toggle invoice status
     */
    async toggleStatus(id: string) {
        const invoice = await this.invoiceModel.findById(id);
        if (!invoice) throw new NotFoundException('Invoice not found');

        invoice.isActive = !invoice.isActive;
        await invoice.save();

        return this.findOneAggregated(id);
    }

    /**
     * Get invoices by client
     */
    async findByClient(clientId: string) {
        if (!Types.ObjectId.isValid(clientId)) throw new BadRequestException('Invalid client ID');

        return this.invoiceModel.aggregate([
            { $match: { clientId: new Types.ObjectId(clientId) } },
            { $sort: { createdAt: -1 } },
            // Same lookups...
            {
                $lookup: {
                    from: 'clients',
                    localField: 'clientId',
                    foreignField: '_id',
                    as: 'client',
                },
            },
            { $unwind: '$client' },
            {
                $lookup: {
                    from: 'currencyinfos',
                    localField: 'currencyId',
                    foreignField: '_id',
                    as: 'currency',
                },
            },
            { $unwind: '$currency' },
            {
                $lookup: {
                    from: 'paymentinfos',
                    localField: 'paymentId',
                    foreignField: '_id',
                    as: 'payment',
                },
            },
            { $unwind: '$payment' },
            {
                $lookup: {
                    from: 'bankinfos',
                    localField: 'bankId',
                    foreignField: '_id',
                    as: 'bank',
                },
            },
            { $unwind: '$bank' },
        ]);
    }
}