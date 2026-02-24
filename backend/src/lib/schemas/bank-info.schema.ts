import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class BankInfo extends Document {
    @Prop({ unique: true })
    bankId: string; // Auto-generated: BNK-00001

    @Prop({ required: true, trim: true })
    name: string; // Bank name (e.g., Sonali Bank, DBBL, City Bank)

    @Prop({ required: true, trim: true })
    accountName: string; // Account holder name

    @Prop({ required: true, trim: true })
    branchName: string; // Branch name

    @Prop({ required: true, trim: true })
    districtName: string; // District name

    @Prop({ required: true, trim: true, unique: true })
    code: string; // Bank code / Account number / Routing number

    @Prop({ default: true })
    isActive: boolean;
}

export const BankInfoSchema = SchemaFactory.createForClass(BankInfo);

// Pre-save hook to auto-generate bankId
BankInfoSchema.pre('save', async function () {
    if (!this.bankId) {
        const count = await this.model('BankInfo').countDocuments();
        this.bankId = `BNK-${String(count + 1).padStart(5, '0')}`;
    }
    // next();
});

// Indexes
BankInfoSchema.index({ code: 1 });
BankInfoSchema.index({ name: 1 });
BankInfoSchema.index({ districtName: 1 });