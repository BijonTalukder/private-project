import { Module } from "@nestjs/common";
import { GSMController } from "./gsm.controller";
import { GSMService } from "./gsm.service";

@Module({
    imports: [],
    controllers: [GSMController],
    providers: [GSMService]
})
export class GsmModule { }