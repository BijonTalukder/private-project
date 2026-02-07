import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateRoleDto, UpdateRoleDto } from "src/lib/dtos/role.dto";
import { Admin } from "src/lib/schemas/admin.schema";
import { Role } from "src/lib/schemas/role.schema";

@Injectable()
export class RoleService {
    constructor(
        @InjectModel(Role.name)
        private readonly roleModel: Model<Role>,
        @InjectModel(Admin.name)
        private readonly adminModel: Model<Admin>
    ) { }
    async createRole(dto: CreateRoleDto) {
        // Check if role name already exists
        const existingRole = await this.roleModel.findOne({ name: dto.name });
        if (existingRole) {
            throw new ConflictException('Role name already exists');
        }

        // Create role
        const role = await this.roleModel.create({
            name: dto.name,
            permissions: dto.permissions,
        });

        return role;
    }

    /**
     * Get all roles
     */
    async findAllRoles() {
        return this.roleModel.find().sort({ createdAt: -1 });
    }

    /**
     * Get single role by ID
     */
    async findRoleById(id: string) {
        const role = await this.roleModel.findById(id);
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        return role;
    }

    /**
     * Update role
     */
    async updateRole(id: string, dto: UpdateRoleDto) {
        const role = await this.roleModel.findById(id);
        if (!role) {
            throw new NotFoundException('Role not found');
        }

        // If updating name, check for duplicates
        if (dto.name && dto.name !== role.name) {
            const existingRole = await this.roleModel.findOne({ name: dto.name });
            if (existingRole) {
                throw new ConflictException('Role name already exists');
            }
        }

        const updated = await this.roleModel.findByIdAndUpdate(id, dto, {
            new: true,
        });

        return updated;
    }

    /**
     * Delete role
     */
    async deleteRole(id: string) {
        const role = await this.roleModel.findById(id);
        if (!role) {
            throw new NotFoundException('Role not found');
        }

        // Check if any admin is using this role
        const adminCount = await this.adminModel.countDocuments({ role: id });
        if (adminCount > 0) {
            throw new BadRequestException(
                `Cannot delete role. ${adminCount} admin(s) are using this role`,
            );
        }

        await this.roleModel.findByIdAndDelete(id);
        return { message: 'Role deleted successfully' };
    }

}