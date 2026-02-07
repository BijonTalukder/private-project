import * as bcrypt from 'bcrypt';

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { getBcryptSaltRounds } from "../utils/bcrypt.util";

export type AdminDocument = HydratedDocument<Admin>;

@Schema({ timestamps: true })
export class Admin {
    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    password: string;


    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: Types.ObjectId, ref: 'Role' })
    role: Types.ObjectId;
}
export const AdminSchema = SchemaFactory.createForClass(Admin)
AdminSchema.pre<AdminDocument>('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    if (this.password) {
        const saltRounds = getBcryptSaltRounds();
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
});
AdminSchema.set('toJSON', {
    transform(_doc, ret: Record<string, any>): Record<string, any> {
        delete ret.password;

        return JSON.parse(JSON.stringify(ret).replace(/_id/g, 'id')) as Record<string, any>;
    },
});