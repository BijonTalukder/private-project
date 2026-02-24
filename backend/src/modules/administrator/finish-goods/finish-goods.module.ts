import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinishGoodsController } from './finish-goods.controller';
import { FinishGoodsService } from './finish-goods.service';

@Module({
    imports: [

    ],
    controllers: [FinishGoodsController],
    providers: [FinishGoodsService],
    exports: [FinishGoodsService],
})
export class FinishGoodsModule { }