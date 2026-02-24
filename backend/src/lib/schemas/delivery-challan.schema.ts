import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class DeliveryChallan extends Document {
    @Prop({ unique: true })
    challanId: string; // Auto-generated: DCH-00001

    @Prop({ required: true, trim: true, unique: true })
    challanNo: string; // User-provided challan number

    @Prop({ type: Types.ObjectId, ref: 'Invoice', required: true })
    invoiceId: Types.ObjectId;

    @Prop({ required: true, type: Date })
    challanDate: Date;

    @Prop({ required: true, type: Number, default: 0 })
    totalDeliveryQty: number; // Sum of all item delivery quantities

    @Prop({ type: String, trim: true })
    remarks: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const DeliveryChallanSchema = SchemaFactory.createForClass(DeliveryChallan);

// Pre-save hook
DeliveryChallanSchema.pre('save', async function () {
    if (!this.challanId) {
        const count = await this.model('DeliveryChallan').countDocuments();
        this.challanId = `DCH-${String(count + 1).padStart(5, '0')}`;
    }
});

// Indexes
DeliveryChallanSchema.index({ invoiceId: 1 });
DeliveryChallanSchema.index({ challanNo: 1 });
DeliveryChallanSchema.index({ challanDate: 1 });