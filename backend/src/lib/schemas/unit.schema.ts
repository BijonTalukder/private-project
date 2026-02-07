import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Unit extends Document {
    @Prop({ unique: true, })
    unitId: string; // Auto-generated: UNT-00001

    @Prop({ required: true, trim: true, unique: true })
    name: string; // e.g., Meter, Yard, Piece, KG

    @Prop({ default: true })
    isActive: boolean;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);

// Pre-save hook to generate unitId
UnitSchema.pre('save', async function () {
    if (!this.unitId) {
        const count = await this.model('Unit').countDocuments();
        this.unitId = `UNT-${String(count + 1).padStart(5, '0')}`;
    }
    // next();
});