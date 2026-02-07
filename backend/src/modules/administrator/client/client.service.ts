import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateClientDto, UpdateClientDto } from "src/lib/dtos/client.dto";
import { Client } from "src/lib/schemas/client.schema";

@Injectable()
export class ClientService {
    constructor(
        @InjectModel(Client.name) private clientModel: Model<Client>,
    ) { }

    async create(dto: CreateClientDto) {
        // Check if email already exists
        const existingEmail = await this.clientModel.findOne({
            email: dto.email,
        });
        if (existingEmail) {
            throw new ConflictException('Email already exists');
        }

        const client = await this.clientModel.create(dto);
        return client;
    }
    async findAll() {
        return this.clientModel.find().sort({ createdAt: -1 });
    }

    /**
     * Get single client by ID
     */
    async findOne(id: string) {
        const client = await this.clientModel.findById(id);
        if (!client) {
            throw new NotFoundException('Client not found');
        }
        return client;
    }

    /**
     * Update client
     */
    async update(id: string, dto: UpdateClientDto) {
        const client = await this.clientModel.findById(id);
        if (!client) {
            throw new NotFoundException('Client not found');
        }

        // Check email uniqueness if updating
        if (dto.email && dto.email !== client.email) {
            const existingEmail = await this.clientModel.findOne({
                email: dto.email,
            });
            if (existingEmail) {
                throw new ConflictException('Email already exists');
            }
        }

        const updated = await this.clientModel.findByIdAndUpdate(id, dto, {
            new: true,
        });

        return updated;
    }

    /**
     * Delete client
     */
    async delete(id: string) {
        const client = await this.clientModel.findById(id);
        if (!client) {
            throw new NotFoundException('Client not found');
        }

        await this.clientModel.findByIdAndDelete(id);
        return { message: 'Client deleted successfully' };
    }

    /**
     * Toggle client status
     */
    async toggleStatus(id: string) {
        const client = await this.clientModel.findById(id);
        if (!client) {
            throw new NotFoundException('Client not found');
        }

        client.isActive = !client.isActive;
        await client.save();

        return client;
    }

    /**
     * Get active clients only
     */
    async findActive() {
        return this.clientModel.find({ isActive: true }).sort({ name: 1 });
    }

    /**
     * Search clients by name or email
     */
    async search(query: string) {
        return this.clientModel.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { clientId: { $regex: query, $options: 'i' } },
            ],
        });
    }
}