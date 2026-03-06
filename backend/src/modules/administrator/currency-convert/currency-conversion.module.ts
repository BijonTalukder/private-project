import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CurrencyConversionController } from './currency-conversion.controller';
import { CurrencyConversionService } from './currency-conversion.service';

@Module({

    controllers: [CurrencyConversionController],
    providers: [CurrencyConversionService],
    exports: [CurrencyConversionService], // Export service for use in other modules
})
export class CurrencyConversionModule { }