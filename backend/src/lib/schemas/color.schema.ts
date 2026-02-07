import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Color extends Document {
    @Prop({ unique: true, })
    colorId: string; // Auto-generated: COL-00001

    @Prop({ required: true, trim: true, unique: true })
    name: string;

    @Prop({ required: true, trim: true })
    type: string; // e.g., Solid, Gradient, Pattern

    @Prop({ default: true })
    isActive: boolean;
}

export const ColorSchema = SchemaFactory.createForClass(Color);

// Pre-save hook to generate colorId
ColorSchema.pre('save', async function () {
    if (!this.colorId) {
        const count = await this.model('Color').countDocuments();
        this.colorId = `COL-${String(count + 1).padStart(5, '0')}`;
    }
    // next();
});