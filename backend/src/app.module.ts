import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './lib/infrastructure/database/database.module';
import { AdministratorModule } from './modules/administrator/administrator.module';
import { SchemaLoaderModule } from './lib/schemas/schema-loader/schema-loader.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: {
        expiresIn: '120d',
      },
    }),
    SchemaLoaderModule,
    DatabaseModule.register(),

    AdministratorModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
