import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Width extends Document {
    @Prop({ unique: true, })
    widthId: string; // Auto-generated: WID-00001

    @Prop({ required: true, trim: true, unique: true })
    name: string; // e.g., 36", 44", 60"

    @Prop({ default: true })
    isActive: boolean;
}

export const WidthSchema = SchemaFactory.createForClass(Width);

// Pre-save hook to generate widthId
WidthSchema.pre('save', async function () {
    if (!this.widthId) {
        const count = await this.model('Width').countDocuments();
        this.widthId = `WID-${String(count + 1).padStart(5, '0')}`;
    }
    // next();
});