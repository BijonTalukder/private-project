import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CronJobService } from './cron-job.service';

@Module({
    imports: [
        HttpModule.register({
            timeout: 30000, // 30 seconds
            maxRedirects: 5,
        }),
    ],
    providers: [CronJobService],
    exports: [CronJobService],
})
export class CronJobModule { }