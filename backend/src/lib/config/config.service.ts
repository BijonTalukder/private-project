import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
    constructor(private readonly config: ConfigService) { }

    get app() {
        return this.config.get('app');
    }

    get database() {
        return this.config.get('database');
    }

    get jwt() {
        return this.config.get('jwt');
    }
}
