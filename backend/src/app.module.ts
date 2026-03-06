import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './lib/infrastructure/database/database.module';
import { AdministratorModule } from './modules/administrator/administrator.module';
import { SchemaLoaderModule } from './lib/schemas/schema-loader/schema-loader.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { CronJobModule } from './lib/schedule/cron-job.module';

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
    ScheduleModule.forRoot(),
    SchemaLoaderModule,
    DatabaseModule.register(),

    AdministratorModule,
    CronJobModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
