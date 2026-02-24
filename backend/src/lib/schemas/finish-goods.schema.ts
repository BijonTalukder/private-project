import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class FinishGoods extends Document {
    @Prop({ unique: true, })
    finishGoodsId: string; // Auto-generated: FGD-00001

    @Prop({ required: true, trim: true, unique: true })
    articleNo: string; // Article number (e.g., FG-ART-2024-001)

    @Prop({ type: Types.ObjectId, ref: 'Color', required: true })
    colorId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Unit', required: true })
    unitId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'GSM', required: true })
    gsmId: Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean;
}

export const FinishGoodsSchema = SchemaFactory.createForClass(FinishGoods);

// Pre-save hook to generate finishGoodsId
FinishGoodsSchema.pre('save', async function () {
    if (!this.finishGoodsId) {
        const count = await this.model('FinishGoods').countDocuments();
        this.finishGoodsId = `FGD-${String(count + 1).padStart(5, '0')}`;
    }
    // next();
});

// Indexes for faster queries
FinishGoodsSchema.index({ articleNo: 1 });
FinishGoodsSchema.index({ colorId: 1 });
FinishGoodsSchema.index({ unitId: 1 });
FinishGoodsSchema.index({ gsmId: 1 });