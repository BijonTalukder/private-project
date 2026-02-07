import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Client extends Document {
    @Prop({ unique: true, })
    clientId: string; // Auto-generated: CLI-00001

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, trim: true })
    address: string;

    @Prop({ required: true })
    contactNo: string;

    @Prop({ required: true })
    personalContactNo: string;

    @Prop({ required: true, lowercase: true, unique: true })
    email: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const ClientSchema = SchemaFactory.createForClass(Client);

// Pre-save hook to generate clientId
ClientSchema.pre('save', async function () {
    if (!this.clientId) {
        const count = await this.model('Client').countDocuments();
        this.clientId = `CLI-${String(count + 1).padStart(5, '0')}`;
    }
});