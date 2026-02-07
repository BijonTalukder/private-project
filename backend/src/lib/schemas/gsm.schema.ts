import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class GSM extends Document {
    @Prop({ unique: true, })
    gsmId: string; // Auto-generated: GSM-00001

    @Prop({ required: true, trim: true, unique: true })
    name: string; // e.g., 100 GSM, 150 GSM, 200 GSM

    @Prop({ default: true })
    isActive: boolean;
}

export const GSMSchema = SchemaFactory.createForClass(GSM);

// Pre-save hook to generate gsmId
GSMSchema.pre('save', async function () {
    if (!this.gsmId) {
        const count = await this.model('GSM').countDocuments();
        this.gsmId = `GSM-${String(count + 1).padStart(5, '0')}`;
    }
    // next();
});