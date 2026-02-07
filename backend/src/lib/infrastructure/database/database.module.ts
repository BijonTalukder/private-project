import { DynamicModule, Module } from '@nestjs/common';
import { MongoModule } from './mongo/mongo.module';

@Module({})
export class DatabaseModule {
    static register(): DynamicModule {
        const dbType = process.env.DB_TYPE || 'mongo';

        if (dbType === 'mongo') {
            return {
                module: DatabaseModule,
                imports: [MongoModule],
            };
        }

        return {
            module: DatabaseModule,
        };
    }
}
