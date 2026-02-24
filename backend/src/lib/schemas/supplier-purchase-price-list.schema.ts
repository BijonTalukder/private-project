import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SupplierPurchasePriceList extends Document {
    @Prop({
        unique: true
    })
    priceListId: string; // Auto-generated: SPL-00001

    @Prop({ type: Types.ObjectId, ref: 'Supplier', required: true })
    supplierId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'PurchaseItemInfo', required: true })
    purchaseItemInfoId: Types.ObjectId;

    @Prop({ required: true, type: Number, min: 0 })
    purchaseRate: number;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: Date, default: null })
    closeDate: Date | null;
}

export const SupplierPurchasePriceListSchema = SchemaFactory.createForClass(SupplierPurchasePriceList);

// Pre-save hook to auto-generate priceListId
SupplierPurchasePriceListSchema.pre('save', async function () {
    if (!this.priceListId) {
        const count = await this.model('SupplierPurchasePriceList').countDocuments();
        this.priceListId = `SPL-${String(count + 1).padStart(5, '0')}`;
    }
    // next();
});

// Indexes
SupplierPurchasePriceListSchema.index({ supplierId: 1 });
SupplierPurchasePriceListSchema.index({ purchaseItemInfoId: 1 });
SupplierPurchasePriceListSchema.index({ isActive: 1 });
SupplierPurchasePriceListSchema.index({ closeDate: 1 });