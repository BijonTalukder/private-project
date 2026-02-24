import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateDeliveryChallanDto, UpdateDeliveryChallanDto } from 'src/lib/dtos/delivery-challan.dto';
import { DeliveryChallanItem } from 'src/lib/schemas/delivery-challan-item.schema';
import { DeliveryChallan } from 'src/lib/schemas/delivery-challan.schema';
import { InvoiceItem } from 'src/lib/schemas/invoice-item.schema';
import { Invoice } from 'src/lib/schemas/invoice.schema';


@Injectable()
export class DeliveryChallanService {
    constructor(
        @InjectModel(DeliveryChallan.name) private challanModel: Model<DeliveryChallan>,
        @InjectModel(DeliveryChallanItem.name) private challanItemModel: Model<DeliveryChallanItem>,
        @InjectModel(Invoice.name) private invoiceModel: Model<any>,
        @InjectModel(InvoiceItem.name) private invoiceItemModel: Model<any>,
    ) { }

    /**
     * Calculate previous delivery quantity for an invoice item
     */
    private async calculatePreviousDelivery(invoiceItemId: string): Promise<number> {
        const result = await this.challanItemModel.aggregate([
            { $match: { invoiceItemId: new Types.ObjectId(invoiceItemId) } },
            { $group: { _id: null, total: { $sum: '$deliveryQty' } } },
        ]);

        // console.log(`Previous delivery for invoice item ${invoiceItemId}:`, result);
        return result[0]?.total || 0;
    }

    /**
     * Get deliverable quantity for an invoice item
     */
    async getDeliverableQty(invoiceItemId: string) {
        const invoiceItem = await this.invoiceItemModel.findById(invoiceItemId);
        if (!invoiceItem) throw new NotFoundException('Invoice item not found');

        const previousDelivery = await this.calculatePreviousDelivery(invoiceItemId);
        const remainingQty = invoiceItem.invoiceQty - previousDelivery;

        return {
            invoiceItemId,
            invoiceQty: invoiceItem.invoiceQty,
            previousDeliveryQty: previousDelivery,
            deliverableQty: remainingQty,
        };
    }

    /**
     * Get delivery summary for entire invoice
     */
    async getInvoiceDeliverySummary(invoiceId: string) {
        if (!Types.ObjectId.isValid(invoiceId)) {
            throw new BadRequestException('Invalid invoice ID');
        }

        // Get invoice
        const invoice = await this.invoiceModel.findById(invoiceId);
        if (!invoice) throw new NotFoundException('Invoice not found');

        // Get invoice items separately
        const invoiceItems = await this.invoiceItemModel
            .find({ invoiceId: new Types.ObjectId(invoiceId) })
            .populate('finishGoodsId', 'articleNo colorId unitId gsmId')
            .populate('supplierPurchasePriceId', 'supplierId');

        // Calculate delivery info for each item
        const itemsWithDeliveryInfo = await Promise.all(
            invoiceItems.map(async (item: any) => {
                const previousDelivery = await this.calculatePreviousDelivery(item._id);
                const deliverableQty = item.invoiceQty - previousDelivery;

                return {
                    _id: item._id,
                    finishGoods: item.finishGoodsId,
                    invoiceQty: item.invoiceQty,
                    previousDeliveryQty: previousDelivery,
                    deliverableQty,
                    unitPrice: item.unitPrice,
                    amount: item.amount,
                };
            })
        );

        return {
            invoice: {
                _id: invoice._id,
                invoiceId: invoice.invoiceId,
                invoiceNo: invoice.invoiceNo,
                client: invoice.clientId, // You may need to populate this
                totalQty: invoice.totalQty,
            },
            items: itemsWithDeliveryInfo,
        };
    }

    /**
     * Create delivery challan
     */
    async create(dto: CreateDeliveryChallanDto) {
        // Check challan number uniqueness
        const existing = await this.challanModel.findOne({ challanNo: dto.challanNo });
        if (existing) throw new ConflictException('Challan number already exists');

        // Verify invoice exists
        const invoice = await this.invoiceModel.findById(dto.invoiceId);
        if (!invoice) throw new NotFoundException('Invoice not found');

        // Validate each item and calculate quantities
        const itemsToCreate: any[] = [];
        let totalDeliveryQty = 0;

        for (const item of dto.items) {
            // Get invoice item
            const invoiceItem = await this.invoiceItemModel.findById(item.invoiceItemId);
            if (!invoiceItem) {
                throw new NotFoundException(`Invoice item ${item.invoiceItemId} not found`);
            }

            // Calculate previous delivery
            const previousDelivery = await this.calculatePreviousDelivery(item.invoiceItemId);
            const remainingQty = invoiceItem.invoiceQty - previousDelivery;
            console.log(`Invoice Item ${item.invoiceItemId}: Invoice Qty=${invoiceItem.invoiceQty}, Previous Delivery=${previousDelivery}, Remaining=${remainingQty}, New Delivery=${item.deliveryQty}`);
            // Validate delivery quantity
            if (item.deliveryQty > remainingQty) {
                throw new BadRequestException(
                    `Delivery quantity (${item.deliveryQty}) exceeds remaining quantity (${remainingQty}) for item ${item.invoiceItemId}`
                );
            }

            totalDeliveryQty += item.deliveryQty;

            itemsToCreate.push({
                invoiceItemId: item.invoiceItemId,
                deliveryQty: item.deliveryQty,
                previousDeliveryQty: previousDelivery,
                remainingQty: remainingQty - item.deliveryQty,
                invoiceQty: invoiceItem.invoiceQty,
            });
        }

        // Create challan
        const challan = await this.challanModel.create({
            challanNo: dto.challanNo,
            invoiceId: new Types.ObjectId(dto.invoiceId),
            challanDate: new Date(dto.challanDate),
            totalDeliveryQty,
            remarks: dto.remarks,
            isActive: dto.isActive ?? true,
        });

        // Create challan items
        const challanItems = itemsToCreate.map((item) => ({
            ...item,
            invoiceItemId: new Types.ObjectId(item.invoiceItemId),
            challanId: challan._id,
        }));
        await this.challanItemModel.insertMany(challanItems);

        // Return with full data
        return this.findOneAggregated(challan._id.toString());
    }

    /**
     * Find all challans with aggregation
     */
    async findAll() {
        return this.challanModel.aggregate([
            { $sort: { createdAt: -1 } },
            // Lookup invoice
            {
                $lookup: {
                    from: 'invoices',
                    localField: 'invoiceId',
                    foreignField: '_id',
                    as: 'invoice',
                },
            },
            { $unwind: '$invoice' },
            // Lookup client from invoice
            {
                $lookup: {
                    from: 'clients',
                    localField: 'invoice.clientId',
                    foreignField: '_id',
                    as: 'client',
                },
            },
            { $unwind: '$client' },
            // Lookup challan items
            {
                $lookup: {
                    from: 'deliverychalanitems',
                    localField: '_id',
                    foreignField: 'challanId',
                    as: 'items',
                },
            },
        ]);
    }

    /**
     * Find single challan with full aggregation
     */
    async findOneAggregated(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid challan ID');
        }

        const result = await this.challanModel.aggregate([
            { $match: { _id: new Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'invoices',
                    localField: 'invoiceId',
                    foreignField: '_id',
                    as: 'invoice',
                },
            },
            { $unwind: '$invoice' },
            {
                $lookup: {
                    from: 'clients',
                    localField: 'invoice.clientId',
                    foreignField: '_id',
                    as: 'client',
                },
            },
            { $unwind: '$client' },
            {
                $lookup: {
                    from: 'deliverychalanitems',
                    localField: '_id',
                    foreignField: 'challanId',
                    as: 'items',
                },
            },
            // Populate finish goods in items
            {
                $lookup: {
                    from: 'invoiceitems',
                    localField: 'items.invoiceItemId',
                    foreignField: '_id',
                    as: 'invoiceItemsData',
                },
            },
            {
                $lookup: {
                    from: 'finishgoods',
                    localField: 'invoiceItemsData.finishGoodsId',
                    foreignField: '_id',
                    as: 'finishGoodsData',
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
                                        invoiceItem: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$invoiceItemsData',
                                                        cond: { $eq: ['$$this._id', '$$item.invoiceItemId'] },
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
            { $project: { invoiceItemsData: 0, finishGoodsData: 0 } },
        ]);

        if (!result || result.length === 0) {
            throw new NotFoundException('Delivery challan not found');
        }

        return result[0];
    }

    /**
     * Find challans by invoice
     */
    async findByInvoice(invoiceId: string) {
        if (!Types.ObjectId.isValid(invoiceId)) {
            throw new BadRequestException('Invalid invoice ID');
        }

        return this.challanModel
            .find({ invoiceId: new Types.ObjectId(invoiceId) })
            .sort({ challanDate: -1 });
    }

    /**
     * Update challan
     */
    async update(id: string, dto: UpdateDeliveryChallanDto) {
        const challan = await this.challanModel.findById(id);
        if (!challan) throw new NotFoundException('Challan not found');

        // If items are being updated, recalculate
        if (dto.items) {
            // Delete old items
            await this.challanItemModel.deleteMany({ challanId: challan._id });

            // Validate and create new items
            const itemsToCreate: any[] = [];
            let totalDeliveryQty = 0;

            for (const item of dto.items) {
                const invoiceItem = await this.invoiceItemModel.findById(item.invoiceItemId);
                if (!invoiceItem) {
                    throw new NotFoundException(`Invoice item ${item.invoiceItemId} not found`);
                }

                // Calculate previous delivery (excluding current challan)
                const previousDelivery = await this.calculatePreviousDelivery(item.invoiceItemId);
                const remainingQty = invoiceItem.invoiceQty - previousDelivery;

                if (item.deliveryQty > remainingQty) {
                    throw new BadRequestException(
                        `Delivery quantity exceeds remaining quantity for item ${item.invoiceItemId}`
                    );
                }

                totalDeliveryQty += item.deliveryQty;

                itemsToCreate.push({
                    challanId: challan._id,
                    invoiceItemId: item.invoiceItemId,
                    deliveryQty: item.deliveryQty,
                    previousDeliveryQty: previousDelivery,
                    remainingQty: remainingQty - item.deliveryQty,
                    invoiceQty: invoiceItem.invoiceQty,
                });
            }

            await this.challanItemModel.insertMany(itemsToCreate);
            dto = { ...dto, totalDeliveryQty } as any;
        }

        // Update challan
        if (dto.challanDate) {
            (dto as any).challanDate = new Date(dto.challanDate);
        }

        await this.challanModel.findByIdAndUpdate(id, dto);
        return this.findOneAggregated(id);
    }

    /**
     * Delete challan
     */
    async delete(id: string) {
        const challan = await this.challanModel.findById(id);
        if (!challan) throw new NotFoundException('Challan not found');

        // Delete items
        await this.challanItemModel.deleteMany({ challanId: challan._id });

        // Delete challan
        await this.challanModel.findByIdAndDelete(id);

        return { message: 'Delivery challan deleted successfully' };
    }

    /**
     * Toggle status
     */
    async toggleStatus(id: string) {
        const challan = await this.challanModel.findById(id);
        if (!challan) throw new NotFoundException('Challan not found');

        challan.isActive = !challan.isActive;
        await challan.save();

        return this.findOneAggregated(id);
    }
}