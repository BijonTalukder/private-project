import mongoose, { Types } from "mongoose";
import { PurchaseItemInfoSchema } from "../schemas/purchase-item.schema";

const PurchaseItemInfo = mongoose.model(
    "PurchaseItemInfo",
    PurchaseItemInfoSchema
);


export const seedPurchaseItems = async () => {

    const items: any[] = [];

    for (let i = 1; i <= 50; i++) {
        items.push({
            articleNo: `ART-2026-${String(i).padStart(3, "0")}`,
            colorId: new Types.ObjectId(),
            unitId: new Types.ObjectId(),
            widthId: new Types.ObjectId(),
            gsmId: new Types.ObjectId(),
            isSameAsFinishGood: true,
            isActive: true,
        });
    }

    await PurchaseItemInfo.insertMany(items);

    console.log("✅ 50 PurchaseItemInfo inserted");

    await mongoose.disconnect();
}

