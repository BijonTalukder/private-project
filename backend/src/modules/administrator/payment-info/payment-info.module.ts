import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentInfoController } from './payment-info.controller';
import { PaymentInfoService } from './payment-info.service';

@Module({
    imports: [

    ],
    controllers: [PaymentInfoController],
    providers: [PaymentInfoService],
    exports: [PaymentInfoService],
})
export class PaymentInfoModule { } 