import { Module } from "@nestjs/common";
import { PurchaseItemInfoController } from "./purchase-item.controller";
import { PurchaseItemInfoService } from "./purchase-item.service";

@Module({
    imports: [],
    controllers: [PurchaseItemInfoController],
    providers: [PurchaseItemInfoService]
})
export class PurchaseItemModule { }