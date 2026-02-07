import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),

        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_URI') || 'mongodb://localhost:27017/rootdevs',
                autoIndex: true,
            }),
        }),
    ],
    exports: [MongooseModule],
})
export class MongoModule { }