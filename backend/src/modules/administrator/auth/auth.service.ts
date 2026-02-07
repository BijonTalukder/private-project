import { Controller, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { LoginDto } from "src/lib/dtos/admin-auth.dto";
import { Admin } from "src/lib/schemas/admin.schema";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { IRequest } from "src/lib/interface/request";

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
        private jwtService: JwtService,
        private configService: ConfigService,

    ) { }
    async login(data: LoginDto) {
        const admin = await this.adminModel.findOne({ email: data.email }).select("+password").populate('role');
        if (!admin) {
            throw new NotFoundException('Admin not found');
        }
        const isPasswordValid = await bcrypt.compare(data.password, admin.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        const accessToken = this.jwtService.sign(
            { id: admin._id.toString(), role: 'admin' },
            {
                expiresIn: '7d',
                secret: this.configService.get<string>('JWT_SECRET_KEY'),
            },
        );
        const refreshToken = this.jwtService.sign(
            { id: admin._id.toString(), role: 'admin' },
            {
                expiresIn: '60d',
                secret: this.configService.get<string>('JWT_SECRET_KEY'),
            },
        );
        return { admin, token: { accessToken, refreshToken } };

    }
    async refreshToken(req: IRequest) {
        try {
            const token = req.headers?.['refresh-token'] as string;
            if (!token) {
                throw new UnauthorizedException('No Refresh token provided');
            }

            const decodedToken = this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_SECRET_KEY'),
            }) as unknown as { id: string };
            const admin = await this.adminModel.findById(decodedToken.id);
            if (!admin) {
                throw new NotFoundException('Admin not found');
            }
            const accessToken = this.jwtService.sign(
                { id: admin._id.toString(), role: 'admin' },
                {
                    expiresIn: '7d',
                    secret: this.configService.get<string>('JWT_SECRET_KEY'),
                },
            );
            return { accessToken };
        } catch {
            throw new UnauthorizedException('Invalid Refresh token');
        }
    }

}