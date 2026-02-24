import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CurrencyInfoController } from './currency-info.controller';
import { CurrencyInfoService } from './currency-info.service';


@Module({
    imports: [
        // MongooseModule.forFeature([
        //     { name: CurrencyInfo.name, schema: CurrencyInfoSchema },
        // ]),
    ],
    controllers: [CurrencyInfoController],
    providers: [CurrencyInfoService],
    exports: [CurrencyInfoService],
})
export class CurrencyInfoModule { }