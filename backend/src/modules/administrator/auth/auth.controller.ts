import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "src/lib/dtos/admin-auth.dto";
import type { IRequest } from "src/lib/interface/request";

@Controller('admin/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {

    }

    @Post('login')
    async login(@Body() body: LoginDto) {

        return await this.authService.login(body);
    }

    @Get('refresh-token')
    async refreshToken(@Req() req: IRequest) {
        return await this.authService.refreshToken(req);
    }

}