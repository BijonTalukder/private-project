import { Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Admin, AdminSchema } from "../admin.schema";
import { Menu, MenuSchema } from "../menu.schema";
import { Role, RoleSchema } from "../role.schema";
import { Supplier, SupplierSchema } from "../supplier.schema";
import { Client, ClientSchema } from "../client.schema";
import { Color, ColorSchema } from "../color.schema";
import { Width, WidthSchema } from "../width.schema";
import { Unit, UnitSchema } from "../unit.schema";
import { GSM, GSMSchema } from "../gsm.schema";
import { PurchaseItemInfo, PurchaseItemInfoSchema } from "../purchase-item.schema";
import { FinishGoods, FinishGoodsSchema } from "../finish-goods.schema";
import { SupplierPurchasePriceList, SupplierPurchasePriceListSchema } from "../supplier-purchase-price-list.schema";
import { CurrencyInfo, CurrencyInfoSchema } from "../currency-info.schema";
import { PaymentInfo, PaymentInfoSchema } from "../payment-info.schema";
import { BankInfo, BankInfoSchema } from "../bank-info.schema";
import { Invoice, InvoiceSchema } from "../invoice.schema";
import { InvoiceItem, InvoiceItemSchema } from "../invoice-item.schema";
import { DeliveryChallan, DeliveryChallanSchema } from "../delivery-challan.schema";
import { DeliveryChallanItem, DeliveryChallanItemSchema } from "../delivery-challan-item.schema";
import { CurrencyConversion, CurrencyConversionSchema } from "../currency-conversion";

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([

            {
                name: Admin.name,
                schema: AdminSchema
            },
            {
                name: Menu.name,
                schema: MenuSchema
            },
            {
                name: Role.name,
                schema: RoleSchema
            },
            {
                name: Supplier.name,
                schema: SupplierSchema
            },
            {
                name: Client.name,
                schema: ClientSchema
            },
            {
                name: Color.name,
                schema: ColorSchema
            },
            {
                name: Width.name,
                schema: WidthSchema
            },
            {
                name: Unit.name,
                schema: UnitSchema
            },
            {
                name: GSM.name,
                schema: GSMSchema
            },
            {
                name: PurchaseItemInfo.name,
                schema: PurchaseItemInfoSchema
            },
            {
                name: FinishGoods.name,
                schema: FinishGoodsSchema
            },
            {
                name: SupplierPurchasePriceList.name,
                schema: SupplierPurchasePriceListSchema
            },
            {
                name: CurrencyInfo.name,
                schema: CurrencyInfoSchema
            },
            {
                name: PaymentInfo.name,
                schema: PaymentInfoSchema
            }, {
                name: BankInfo.name,
                schema: BankInfoSchema
            },
            {
                name: Invoice.name,
                schema: InvoiceSchema
            },
            {
                name: InvoiceItem.name,
                schema: InvoiceItemSchema
            },
            {
                name: DeliveryChallan.name,
                schema: DeliveryChallanSchema
            },
            {
                name: DeliveryChallanItem.name,
                schema: DeliveryChallanItemSchema
            },
            {
                name: CurrencyConversion.name,
                schema: CurrencyConversionSchema
            }






        ])
    ],
    exports: [MongooseModule]
})
export class SchemaLoaderModule { }