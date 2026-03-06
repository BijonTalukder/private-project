import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class CurrencyConversion extends Document {
    @Prop({ unique: true })
    conversionId: string; // Auto-generated: CCR-00001

    @Prop({ type: Types.ObjectId, ref: 'CurrencyInfo', required: true })
    fromCurrencyId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'CurrencyInfo', required: true })
    toCurrencyId: Types.ObjectId;

    @Prop({ required: true, type: Number, min: 0 })
    exchangeRate: number; // e.g., 1 USD = 110 BDT, so rate = 110

    @Prop({ type: Date, default: null })
    effectiveDate: Date | null; // When this rate became effective

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: String })
    notes: string; // Optional notes about this conversion rate
}

export const CurrencyConversionSchema = SchemaFactory.createForClass(CurrencyConversion);

// Pre-save hook to auto-generate conversionId
CurrencyConversionSchema.pre('save', async function () {
    if (!this.conversionId) {
        const count = await this.model('CurrencyConversion').countDocuments();
        this.conversionId = `CCR-${String(count + 1).padStart(5, '0')}`;
    }
});

// Indexes
CurrencyConversionSchema.index({ fromCurrencyId: 1, toCurrencyId: 1 });
CurrencyConversionSchema.index({ isActive: 1 });
CurrencyConversionSchema.index({ effectiveDate: -1 });

// Compound unique index to prevent duplicate conversion pairs
CurrencyConversionSchema.index(
    { fromCurrencyId: 1, toCurrencyId: 1 },
    {
        unique: true,
        partialFilterExpression: { isActive: true }
    }
);