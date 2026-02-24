import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupplierPurchasePriceListController } from './supplier-purchase-price-list.controller';
import { SupplierPurchasePriceListService } from './supplier-purchase-price-list.service';


@Module({
    imports: [


    ],
    controllers: [SupplierPurchasePriceListController],
    providers: [SupplierPurchasePriceListService],
    exports: [SupplierPurchasePriceListService],
})
export class SupplierPurchasePriceListModule { }