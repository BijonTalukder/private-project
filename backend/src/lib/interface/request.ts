import { Request } from 'express';
import mongoose from 'mongoose';

export interface RequestedUser {
    id: mongoose.Types.ObjectId;
    email?: string;

    name?: string;
    role: 'admin';
}

export interface IRequest extends Request {
    user?: RequestedUser;
}
