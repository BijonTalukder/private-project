import { Module } from "@nestjs/common";
import { WidthController } from "./width.controller";
import { WidthService } from "./width.service";

@Module({
    imports: [],
    controllers: [WidthController],
    providers: [WidthService]
})
export class WidthModule { }