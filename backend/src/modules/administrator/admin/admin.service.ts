import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateAdminDto, UpdateAdminDto } from "src/lib/dtos/admin.dto";
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from "src/lib/schemas/admin.schema";
import { Model } from "mongoose";
import { ConflictException } from "@nestjs/common";
import { Role, roleDocument } from "src/lib/schemas/role.schema";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(Admin.name)
        private readonly adminModel: Model<AdminDocument>,
        @InjectModel(Role.name)
        private readonly roleModel: Model<roleDocument>,
    ) { }
    async createAdmin(dto: CreateAdminDto) {
        // Check if email already exists
        const existingAdmin = await this.adminModel.findOne({ email: dto.email });
        if (existingAdmin) {
            throw new ConflictException('Email already exists');
        }

        // Check if role exists
        const role = await this.roleModel.findById(dto.role);
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        const admin = new this.adminModel(dto);
        await admin.save()

        // Return admin with role populated
        return await this.adminModel
            .findById(admin._id)
            .populate('role')
            .select('-password');
    }

    async findAllAdmins() {
        return this.adminModel
            .find()
            .populate('role')
            .select('-password')
            .sort({ createdAt: -1 });
    }

    async findAdminById(id: string) {
        const admin = await this.adminModel
            .findById(id)
            .populate('role')
            .select('-password');

        if (!admin) {
            throw new NotFoundException('Admin not found');
        }

        return admin;
    }
    async updateAdmin(id: string, dto: UpdateAdminDto) {
        const admin = await this.adminModel.findById(id);
        if (!admin) {
            throw new NotFoundException('Admin not found');
        }

        // If updating email, check for duplicates
        if (dto.email && dto.email !== admin.email) {
            const existingAdmin = await this.adminModel.findOne({ email: dto.email });
            if (existingAdmin) {
                throw new ConflictException('Email already exists');
            }
        }

        // If updating role, check if it exists
        if (dto.role) {
            const role = await this.roleModel.findById(dto.role);
            if (!role) {
                throw new NotFoundException('Role not found');
            }
        }

        // If updating password, hash it
        if (dto.password) {
            dto.password = await bcrypt.hash(dto.password, 10);
        }

        const updated = await this.adminModel
            .findByIdAndUpdate(id, dto, { new: true })
            .populate('role')
            .select('-password');

        return updated;
    }
    async deleteAdmin(id: string) {
        const admin = await this.adminModel.findById(id);
        if (!admin) {
            throw new NotFoundException('Admin not found');
        }

        await this.adminModel.findByIdAndDelete(id);
        return { message: 'Admin deleted successfully' };
    }
    async toggleAdminStatus(id: string) {
        const admin = await this.adminModel.findById(id);
        if (!admin) {
            throw new NotFoundException('Admin not found');
        }

        admin.isActive = !admin.isActive;
        await admin.save();

        return this.adminModel
            .findById(id)
            .populate('role')
            .select('-password');
    }

}