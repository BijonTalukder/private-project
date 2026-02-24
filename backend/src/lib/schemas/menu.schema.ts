import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Menu extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    key: string; // Route key

    @Prop({ type: Types.ObjectId, ref: 'Menu', default: null })
    parent: Types.ObjectId | null; // Parent menu reference

    @Prop({ type: Number, default: 0 })
    level: number; // 0 = root, 1 = first child, 2 = second child, etc.

    @Prop({ type: Number, default: 0 })
    order: number; // Display order
}

export const MenuSchema = SchemaFactory.createForClass(Menu);

// Index for faster queries
MenuSchema.index({ parent: 1, order: 1 });
MenuSchema.index({ key: 1 });