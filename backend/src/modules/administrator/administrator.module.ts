import { Module } from "@nestjs/common";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { MenuModule } from "./menu/menu.module";
import { RoleModule } from "./role/role.module";
import { SupplierModule } from "./supplier/supplier.module";
import { ClientModule } from "./client/client.module";
import { ColorModule } from "./color/color.module";
import { WidthModule } from "./width/width.module";
import { UnitModule } from "./unit/unit.module";
import { GsmModule } from "./gsm/gsm.module";
import { PurchaseItemModule } from "./purchase-item/purchase-item.module";
import { FinishGoodsModule } from "./finish-goods/finish-goods.module";
import { SupplierPurchasePriceListModule } from "./supplier-purchase-price/supplier-purchase-price-list.module";
import { CurrencyInfoModule } from "./currency-info/currency-info.module";
import { PaymentInfoModule } from "./payment-info/payment-info.module";
import { BankInfoModule } from "./bank-info/bank-info.module";
import { InvoiceModule } from "./invoice/invoice.module";
import { DeliveryChallanModule } from "./delivery-challan/delivery-challan.module";

@Module({
    imports: [
        AdminModule,
        AuthModule,
        MenuModule,
        RoleModule,
        SupplierModule,
        ClientModule,
        ColorModule,
        WidthModule,
        UnitModule,
        GsmModule,
        PurchaseItemModule,
        FinishGoodsModule,
        SupplierPurchasePriceListModule,
        CurrencyInfoModule,
        PaymentInfoModule,
        BankInfoModule,
        InvoiceModule,
        DeliveryChallanModule
    ],
    providers: []
})
export class AdministratorModule { }