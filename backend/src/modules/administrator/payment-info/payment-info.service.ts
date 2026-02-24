import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePaymentInfoDto, UpdatePaymentInfoDto } from 'src/lib/dtos/payment-info.dto';
import { PaymentInfo } from 'src/lib/schemas/payment-info.schema';


@Injectable()
export class PaymentInfoService {
    constructor(
        @InjectModel(PaymentInfo.name)
        private paymentModel: Model<PaymentInfo>,
    ) { }

    async create(dto: CreatePaymentInfoDto) {
        const existing = await this.paymentModel.findOne({ name: dto.name });
        if (existing) throw new ConflictException('Payment method name already exists');
        return this.paymentModel.create(dto);
    }

    async findAll() {
        return this.paymentModel.find().sort({ createdAt: -1 });
    }

    async findActive() {
        return this.paymentModel.find({ isActive: true }).sort({ name: 1 });
    }

    async findOne(id: string) {
        const payment = await this.paymentModel.findById(id);
        if (!payment) throw new NotFoundException('Payment method not found');
        return payment;
    }

    async update(id: string, dto: UpdatePaymentInfoDto) {
        const payment = await this.paymentModel.findById(id);
        if (!payment) throw new NotFoundException('Payment method not found');

        if (dto.name && dto.name !== payment.name) {
            const existing = await this.paymentModel.findOne({ name: dto.name });
            if (existing) throw new ConflictException('Payment method name already exists');
        }

        return this.paymentModel.findByIdAndUpdate(id, dto, { new: true });
    }

    async delete(id: string) {
        const payment = await this.paymentModel.findById(id);
        if (!payment) throw new NotFoundException('Payment method not found');
        await this.paymentModel.findByIdAndDelete(id);
        return { message: 'Payment method deleted successfully' };
    }

    async toggleStatus(id: string) {
        const payment = await this.paymentModel.findById(id);
        if (!payment) throw new NotFoundException('Payment method not found');
        payment.isActive = !payment.isActive;
        await payment.save();
        return payment;
    }
}