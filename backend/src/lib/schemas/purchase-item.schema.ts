import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PurchaseItemInfo extends Document {
    @Prop({ unique: true, })
    purchaseItemId: string; // Auto-generated: PII-00001

    @Prop({ required: true, trim: true, unique: true })
    articleNo: string; // Article number (e.g., ART-2024-001)

    @Prop({ type: Types.ObjectId, ref: 'Color', required: true })
    colorId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Unit', required: true })
    unitId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'GSM', required: true })
    gsmId: Types.ObjectId;

    @Prop({ default: false })
    isSameAsFinishGood: boolean;

    @Prop({ default: true })
    isActive: boolean;
}

export const PurchaseItemInfoSchema = SchemaFactory.createForClass(PurchaseItemInfo);

// Pre-save hook to generate purchaseItemId
PurchaseItemInfoSchema.pre('save', async function () {
    if (!this.purchaseItemId) {
        const count = await this.model('PurchaseItemInfo').countDocuments();
        this.purchaseItemId = `PII-${String(count + 1).padStart(5, '0')}`;
    }
    // next();
});

// Index for faster queries
PurchaseItemInfoSchema.index({ articleNo: 1 });
PurchaseItemInfoSchema.index({ colorId: 1 });
PurchaseItemInfoSchema.index({ unitId: 1 });
PurchaseItemInfoSchema.index({ gsmId: 1 });