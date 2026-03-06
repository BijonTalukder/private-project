import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CronJobService {
    private readonly logger = new Logger(CronJobService.name);

    constructor(private readonly httpService: HttpService) { }

    @Cron('*/5 * * * *', {
        name: 'api-hit-every-5-minutes',
        timeZone: 'Asia/Dhaka',
    })
    async hitApiEvery5Minutes() {
        this.logger.log('🔄 Cron job started - Hitting APIs...');

        // 👉 2 ta API
        const apis = [
            // 1️⃣ Own server ping (sleep prevent)
            // 'https://private-project-ur1i.onrender.com/health',

            // 2️⃣ Monitoring ping
            'https://cron-backend-one.vercel.app/api/ping/98b211f0-84cf-4b4a-849f-a988b3e16a6f',
        ];

        try {
            // 👉 Parallel API hit (fast + clean)
            await Promise.all(
                apis.map((url) =>
                    firstValueFrom(
                        this.httpService.get(url, {
                            timeout: 30000,
                        })
                    )
                )
            );

            this.logger.log('✅ All APIs hit successfully');

            // return { success: true };
        } catch (error: any) {
            this.logger.error(`❌ API hit failed: ${error.message}`, error.stack);

            return {
                success: false,
                error: error.message,
            };
        }
    }
}