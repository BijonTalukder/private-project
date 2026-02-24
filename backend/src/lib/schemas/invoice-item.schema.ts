import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class InvoiceItem extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Invoice', required: true })
    invoiceId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'FinishGoods', required: true })
    finishGoodsId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'SupplierPurchasePriceList', required: true })
    supplierPurchasePriceId: Types.ObjectId;

    @Prop({ required: true, type: Number, min: 0 })
    invoiceQty: number;

    @Prop({ required: true, type: Number, min: 0 })
    unitPrice: number;

    @Prop({ required: true, type: Number, default: 0 })
    commission: number;

    @Prop({ required: true, type: Number, min: 0 })
    price: number;

    @Prop({ required: true, type: Number, min: 0 })
    amount: number;
}

export const InvoiceItemSchema = SchemaFactory.createForClass(InvoiceItem);
InvoiceItemSchema.index({ invoiceId: 1 });
InvoiceItemSchema.index({ finishGoodsId: 1 });