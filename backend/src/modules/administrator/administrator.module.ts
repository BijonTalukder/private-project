import { Module } from "@nestjs/common";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { MenuModule } from "./menu/menu.module";
import { RoleModule } from "./role/role.module";
import { SupplierModule } from "./supplier/supplier.module";
import { ClientModule } from "./client/client.module";
import { ColorModule } from "./color/color.module";
import { WidthModule } from "./width/width.module";
import { UnitModule } from "./unit/unit.module";
import { GsmModule } from "./gsm/gsm.module";

@Module({
    imports: [
        AdminModule,
        AuthModule,
        MenuModule,
        RoleModule,
        SupplierModule,
        ClientModule,
        ColorModule,
        WidthModule,
        UnitModule,
        GsmModule
    ],
    providers: []
})
export class AdministratorModule { }