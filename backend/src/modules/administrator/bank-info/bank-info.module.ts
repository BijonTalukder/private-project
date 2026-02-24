import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BankInfoController } from './bank-info.controller';
import { BankInfoService } from './bank-info.service';

@Module({
    imports: [

    ],
    controllers: [BankInfoController],
    providers: [BankInfoService],
    exports: [BankInfoService],
})
export class BankInfoModule { }