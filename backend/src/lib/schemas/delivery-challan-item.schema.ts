import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class DeliveryChallanItem extends Document {
    @Prop({ type: Types.ObjectId, ref: 'DeliveryChallan', required: true })
    challanId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'InvoiceItem', required: true })
    invoiceItemId: Types.ObjectId;

    @Prop({ required: true, type: Number, min: 0 })
    deliveryQty: number;

    @Prop({ required: true, type: Number, min: 0 })
    previousDeliveryQty: number;

    @Prop({ required: true, type: Number, min: 0 })
    remainingQty: number; // Quantity still to be delivered

    @Prop({ required: true, type: Number, min: 0 })
    invoiceQty: number; // Total quantity from invoice (for reference)
}

export const DeliveryChallanItemSchema = SchemaFactory.createForClass(DeliveryChallanItem);

// Indexes
DeliveryChallanItemSchema.index({ challanId: 1 });
DeliveryChallanItemSchema.index({ invoiceItemId: 1 });