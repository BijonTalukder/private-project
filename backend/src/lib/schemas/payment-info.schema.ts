import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PaymentInfo extends Document {
    @Prop({ unique: true })
    paymentId: string; // Auto-generated: PAY-00001

    @Prop({ required: true, trim: true, unique: true })
    name: string; // e.g., Cash, Bank Transfer, Credit Card, Mobile Banking

    @Prop({ required: true, trim: true })
    type: string; // e.g., Cash, Online, Card, Mobile, Bank

    @Prop({ default: true })
    isActive: boolean;
}

export const PaymentInfoSchema = SchemaFactory.createForClass(PaymentInfo);

// Pre-save hook to auto-generate paymentId
PaymentInfoSchema.pre('save', async function () {
    if (!this.paymentId) {
        const count = await this.model('PaymentInfo').countDocuments();
        this.paymentId = `PAY-${String(count + 1).padStart(5, '0')}`;
    }
    // next();
});