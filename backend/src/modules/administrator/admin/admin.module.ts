import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
    imports: [],
    exports: [],
    controllers: [AdminController],
    providers: [AdminService]
})
export class AdminModule { }