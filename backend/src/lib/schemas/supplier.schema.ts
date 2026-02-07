import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Supplier extends Document {
    @Prop({ unique: true })
    supplierId: string; // Auto-generated: SUP-00001

    @Prop({ required: true, trim: true })
    supplierName: string;

    @Prop({ trim: true, sparse: true, unique: true })
    supplierCode: string;

    @Prop({ required: true, trim: true })
    contactPerson: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true, lowercase: true })
    email: string;

    @Prop({ trim: true })
    address: string;

    @Prop({ trim: true })
    gstNumber: string;

    @Prop({ trim: true })
    tinNumber: string;

    @Prop({ trim: true })
    licenseNumber: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);

// Pre-save hook to generate supplierId
SupplierSchema.pre('save', async function () {
    if (!this.supplierId) {
        const count = await this.model('Supplier').countDocuments();
        this.supplierId = `SUP-${String(count + 1).padStart(5, '0')}`;
    }
    // next();
});