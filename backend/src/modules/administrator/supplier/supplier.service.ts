import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateSupplierDto, UpdateSupplierDto } from "src/lib/dtos/supplier.dto";
import { Supplier } from "src/lib/schemas/supplier.schema";

@Injectable()
export class SupplierService {
    constructor(
        @InjectModel(Supplier.name) private supplierModel: Model<Supplier>,
    ) { }
    async create(dto: CreateSupplierDto) {
        // Check if email already exists
        const existingEmail = await this.supplierModel.findOne({
            email: dto.email,
        });
        if (existingEmail) {
            throw new ConflictException('Email already exists');
        }

        // Check if supplierCode already exists (if provided)
        if (dto.supplierCode) {
            const existingCode = await this.supplierModel.findOne({
                supplierCode: dto.supplierCode,
            });
            if (existingCode) {
                throw new ConflictException('Supplier code already exists');
            }
        }

        const supplier = await this.supplierModel.create(dto);
        return supplier;
    }

    async findAll() {
        return this.supplierModel.find().sort({ createdAt: -1 });
    }
    async findOne(id: string) {
        const supplier = await this.supplierModel.findById(id);
        if (!supplier) {
            throw new NotFoundException('Supplier not found');
        }
        return supplier;
    }
    async update(id: string, dto: UpdateSupplierDto) {
        const supplier = await this.supplierModel.findById(id);
        if (!supplier) {
            throw new NotFoundException('Supplier not found');
        }

        // Check email uniqueness if updating
        if (dto.email && dto.email !== supplier.email) {
            const existingEmail = await this.supplierModel.findOne({
                email: dto.email,
            });
            if (existingEmail) {
                throw new ConflictException('Email already exists');
            }
        }

        // Check supplierCode uniqueness if updating
        if (dto.supplierCode && dto.supplierCode !== supplier.supplierCode) {
            const existingCode = await this.supplierModel.findOne({
                supplierCode: dto.supplierCode,
            });
            if (existingCode) {
                throw new ConflictException('Supplier code already exists');
            }
        }

        const updated = await this.supplierModel.findByIdAndUpdate(id, dto, {
            new: true,
        });

        return updated;
    }

    async delete(id: string) {
        const supplier = await this.supplierModel.findById(id);
        if (!supplier) {
            throw new NotFoundException('Supplier not found');
        }

        await this.supplierModel.findByIdAndDelete(id);
        return { message: 'Supplier deleted successfully' };
    }

    async toggleStatus(id: string) {
        const supplier = await this.supplierModel.findById(id);
        if (!supplier) {
            throw new NotFoundException('Supplier not found');
        }

        supplier.isActive = !supplier.isActive;
        await supplier.save();

        return supplier;
    }

    async findActive() {
        return this.supplierModel.find({ isActive: true }).sort({ supplierName: 1 });
    }


}