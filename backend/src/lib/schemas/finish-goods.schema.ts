import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { generateNextId } from '../utils/generate-id.util';

@Schema({ timestamps: true })
export class FinishGoods extends Document {
    @Prop({ unique: true, })
    finishGoodsId: string; // Auto-generated: FGD-00001

    @Prop({ required: true, trim: true })
    articleNo: string; // Article number (e.g., FG-ART-2024-001)

    @Prop({ type: Types.ObjectId, ref: 'Color', required: true })
    colorId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Unit', required: true })
    unitId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Width", required: true })
    widthId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'GSM', required: true })
    gsmId: Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean;
}

export const FinishGoodsSchema = SchemaFactory.createForClass(FinishGoods);

// Pre-save hook to generate finishGoodsId
FinishGoodsSchema.pre('save', async function () {
    if (!this.finishGoodsId) {
        this.finishGoodsId = await generateNextId(
            this.model('FinishGoods'),
            'finishGoodsId',
            'FGD',
        );
    }
    // next();
});

// Indexes for faster queries
FinishGoodsSchema.index({ articleNo: 1 });
FinishGoodsSchema.index({ colorId: 1 });
FinishGoodsSchema.index({ unitId: 1 });
FinishGoodsSchema.index({ gsmId: 1 });