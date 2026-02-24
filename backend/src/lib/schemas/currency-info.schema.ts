import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CurrencyInfo extends Document {
    @Prop({ unique: true })
    currencyId: string; // Auto-generated: CUR-00001

    @Prop({ required: true, trim: true, unique: true })
    name: string; // e.g., US Dollar, Euro, BDT

    @Prop({ required: true, trim: true })
    type: string; // e.g., Fiat, Crypto, Local, Foreign

    @Prop({ default: true })
    isActive: boolean;
}

export const CurrencyInfoSchema = SchemaFactory.createForClass(CurrencyInfo);

// Pre-save hook to auto-generate currencyId
CurrencyInfoSchema.pre('save', async function () {
    if (!this.currencyId) {
        const count = await this.model('CurrencyInfo').countDocuments();
        this.currencyId = `CUR-${String(count + 1).padStart(5, '0')}`;
    }
});