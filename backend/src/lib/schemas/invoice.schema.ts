import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { generateSerial } from '../utils/generateSerial';

@Schema({ timestamps: true })
export class Invoice extends Document {
    @Prop({ unique: true, })
    invoiceId: string; // INV-00001

    @Prop({ trim: true, unique: true })
    invoiceNo: string;

    @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
    clientId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'CurrencyInfo', required: true })
    currencyId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'PaymentInfo', required: true })
    paymentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'BankInfo', required: true })
    bankId: Types.ObjectId;

    @Prop({ required: true, type: Number, default: 0 })
    totalQty: number;

    @Prop({ required: true, type: Number, default: 0 })
    totalAmount: number;

    @Prop({ required: true, type: Number, default: 0 })
    totalCommissionAmount: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.pre('save', async function () {
    if (!this.invoiceId) {
        const serial = await generateSerial(this.model('Invoice'), 'ANI', 'invoiceId');
        this.invoiceNo = serial
        this.invoiceId = serial;
    }
    // next();
});
InvoiceSchema.index({ invoiceNo: 1 });
InvoiceSchema.index({ clientId: 1 });
InvoiceSchema.index({ createdAt: -1 });