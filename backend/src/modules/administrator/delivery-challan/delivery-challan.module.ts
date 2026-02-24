import { Module } from '@nestjs/common';
import { DeliveryChallanController } from './delivery-challan.controller';
import { DeliveryChallanService } from './delivery-challan.service';

@Module({
    imports: [

    ],
    controllers: [DeliveryChallanController],
    providers: [DeliveryChallanService],
    exports: [DeliveryChallanService],
})
export class DeliveryChallanModule { }