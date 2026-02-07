import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, Types } from "mongoose";
export type roleDocument = HydratedDocument<Role>
@Schema({ timestamps: true, versionKey: false })
export class Role extends Document {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({
        type: [
            {
                menuId: { type: Types.ObjectId, ref: 'Menu', required: true },
                menuName: { type: String },
                menuKey: { type: String },
                create: { type: Boolean, default: false },
                read: { type: Boolean, default: false },
                update: { type: Boolean, default: false },
                delete: { type: Boolean, default: false }



                // actions: {
                //     type: [String],
                //     enum: ['create', 'read', 'update', 'delete'],
                // },
            },
        ],
        default: [],
    })
    permissions: {
        menuId: Types.ObjectId;
        menuName: string;
        menuKey: string;
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
        // actions: string[];
    }[];

    @Prop({ default: true })
    isActive: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
