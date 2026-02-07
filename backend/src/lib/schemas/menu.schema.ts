import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, Types } from "mongoose";

export type menuDocument = HydratedDocument<Menu>
@Schema({ versionKey: false, timestamps: true })
export class Menu extends Document {

    @Prop({ required: true })
    name: string
    @Prop({ required: true, unique: true })
    key: string;         // order, user, product

    @Prop({ type: Types.ObjectId, ref: 'Menu', default: null })
    parent: Types.ObjectId | null;

}
export const MenuSchema = SchemaFactory.createForClass(Menu);