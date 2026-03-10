import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePurchaseItemInfoDto, UpdatePurchaseItemInfoDto } from 'src/lib/dtos/purchase-item-info.dto';
import { FinishGoods } from 'src/lib/schemas/finish-goods.schema';
import { PurchaseItemInfo } from 'src/lib/schemas/purchase-item.schema';
import { generateNextId } from 'src/lib/utils/generate-id.util';

@Injectable()
export class PurchaseItemInfoService {
    constructor(
        @InjectModel(PurchaseItemInfo.name)
        private purchaseItemInfoModel: Model<PurchaseItemInfo>,
        @InjectModel(FinishGoods.name)
        private finishGoodsModel: Model<FinishGoods>,
    ) { }
    private get populateQuery() {
        return [
            { path: 'colorId', select: 'colorId name type' },
            { path: 'unitId', select: 'unitId name' },
            { path: 'gsmId', select: 'gsmId name' },
            { path: 'widthId', select: 'widthId name' },
        ];
    }

    // ── Shared ObjectId validator ─────────────────────────────────────────────
    private validateIds(dto: CreatePurchaseItemInfoDto) {
        if (!Types.ObjectId.isValid(dto.colorId)) throw new BadRequestException('Invalid color ID');
        if (!Types.ObjectId.isValid(dto.unitId)) throw new BadRequestException('Invalid unit ID');
        if (!Types.ObjectId.isValid(dto.gsmId)) throw new BadRequestException('Invalid GSM ID');
        if (!Types.ObjectId.isValid(dto.widthId)) throw new BadRequestException('Invalid width ID');
    }

    async create(dto: CreatePurchaseItemInfoDto) {
        const session = await this.purchaseItemInfoModel.db.startSession();
        session.startTransaction();

        try {
            // ── Validate ObjectIds ────────────────────────────────────────────────
            this.validateIds(dto); // throws BadRequestException if any ID is invalid

            // ── Duplicate check (inside transaction) ──────────────────────────────
            const existingArticle = await this.purchaseItemInfoModel
                .findOne({
                    articleNo: dto.articleNo,
                    colorId: dto.colorId,
                    widthId: dto.widthId,
                    unitId: dto.unitId,
                })
                .session(session);

            if (existingArticle) {
                throw new ConflictException('Article number already exists');
            }

            // ── Create finish good if flagged (inside transaction) ─────────────────
            if (dto.isSameAsFinishGood) {
                await this.finishGoodsModel.create(
                    [
                        {
                            ...dto,
                            finishGoodsId: await generateNextId(
                                this.finishGoodsModel,
                                'finishGoodsId',
                                'FGD',
                            ),
                        },
                    ],
                    { session },
                );
            }

            // ── Create purchase item (inside transaction) ──────────────────────────
            const [purchaseItem] = await this.purchaseItemInfoModel.create(
                [
                    {
                        ...dto,
                        purchaseItemId: await generateNextId(
                            this.purchaseItemInfoModel,
                            'purchaseItemId',
                            'PII',
                        ),
                    },
                ],
                { session },
            );

            // ── Commit ────────────────────────────────────────────────────────────
            await session.commitTransaction();

            // ── Populate after commit (outside transaction) ────────────────────────
            return this.purchaseItemInfoModel
                .findById(purchaseItem._id)
                .populate('colorId', 'colorId name type')
                .populate('unitId', 'unitId name')
                .populate('widthId', 'widthId name')
                .populate('gsmId', 'gsmId name');

        } catch (err) {
            await session.abortTransaction();
            throw err; // re-throw so NestJS returns the correct HTTP error
        } finally {
            session.endSession();
        }
    }

    async createMany(dtos: CreatePurchaseItemInfoDto[]) {
        if (!dtos || !Array.isArray(dtos) || dtos.length === 0) {
            return {
                created: [],
                errors: [],
                summary: { total: 0, success: 0, failed: 0 },
            };
        }

        // ── Start a MongoDB session & transaction ─────────────────────────────────
        // If ANY item fails, the entire transaction is rolled back.
        // Nothing is written to the DB unless every single item succeeds.
        const session = await this.purchaseItemInfoModel.db.startSession();
        session.startTransaction();

        const results: PurchaseItemInfo[] = [];
        const errors: { index: number; articleNo: string; message: string }[] = [];

        try {
            for (let i = 0; i < dtos.length; i++) {
                const dto = dtos[i];

                this.validateIds(dto); // throws → caught below → rollback

                const exists = await this.purchaseItemInfoModel
                    .findOne({
                        articleNo: dto.articleNo,
                        colorId: dto.colorId,
                        widthId: dto.widthId,
                        unitId: dto.unitId,
                    })
                    .session(session); // ← read inside the transaction

                if (exists) {
                    // Treat duplicate as a hard error so the whole batch rolls back
                    throw new ConflictException(
                        `Row ${i + 1}: Article "${dto.articleNo}" already exists`,
                    );
                }

                if (dto.isSameAsFinishGood) {
                    await this.finishGoodsModel.create(
                        [
                            {
                                ...dto,
                                finishGoodsId: await generateNextId(
                                    this.finishGoodsModel,
                                    'finishGoodsId',
                                    'FGD',
                                ),
                            },
                        ],
                        { session }, // ← write inside the transaction
                    );
                }

                const [created] = await this.purchaseItemInfoModel.create(
                    [
                        {
                            ...dto,
                            purchaseItemId: await generateNextId(
                                this.purchaseItemInfoModel,
                                'purchaseItemId',
                                'PII',
                            ),
                        },
                    ],
                    { session }, // ← write inside the transaction
                );

                // populate cannot use session, but we only read after commit anyway
                results.push(created);
            }

            // ── All items OK → commit ─────────────────────────────────────────────
            await session.commitTransaction();

            // Populate after commit (outside transaction — read-only, safe)
            const populated = await Promise.all(
                results.map((item) =>
                    this.purchaseItemInfoModel
                        .findById(item._id)
                        .populate(this.populateQuery as any),
                ),
            );

            return {
                created: populated,
                errors: [],
                summary: { total: dtos.length, success: populated.length, failed: 0 },
            };

        } catch (err: any) {
            // ── Any error → rollback everything ──────────────────────────────────
            await session.abortTransaction();

            // Return structured error so frontend can show what went wrong
            return {
                created: [],
                errors: [
                    {
                        index: -1,
                        articleNo: '',
                        message: err?.message ?? 'Transaction failed — no items were saved',
                    },
                ],
                summary: { total: dtos.length, success: 0, failed: dtos.length },
            };

        } finally {
            // Always end the session whether commit or rollback
            session.endSession();
        }
    }
    async findAll() {
        return this.purchaseItemInfoModel
            .find()
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('widthId', 'widthId name')

            .populate('gsmId', 'gsmId name')
            .sort({ createdAt: -1 });
    }


    async findActive() {
        return this.purchaseItemInfoModel
            .find({ isActive: true })
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('widthId', 'widthId name')

            .populate('gsmId', 'gsmId name')
            .sort({ articleNo: 1 });
    }


    async findSameAsFinishGood() {
        return this.purchaseItemInfoModel
            .find({ isSameAsFinishGood: true, isActive: true })
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('widthId', 'widthId name')

            .populate('gsmId', 'gsmId name')
            .sort({ articleNo: 1 });
    }

    async findOne(id: string) {
        const item = await this.purchaseItemInfoModel
            .findById(id)
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('widthId', 'widthId name')

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
            .populate('widthId', 'widthId name')

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
            .populate('widthId', 'widthId name')

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
            .populate('widthId', 'widthId name')

            .populate('gsmId', 'gsmId name');
    }


    async searchByArticleNo(query: string) {
        return this.purchaseItemInfoModel
            .find({
                articleNo: { $regex: query, $options: 'i' },
            })
            .populate('colorId', 'colorId name type')
            .populate('unitId', 'unitId name')
            .populate('widthId', 'widthId name')

            .populate('gsmId', 'gsmId name');
    }
}