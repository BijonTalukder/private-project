import { Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Admin, AdminSchema } from "../admin.schema";
import { Menu, MenuSchema } from "../menu.schema";
import { Role, RoleSchema } from "../role.schema";
import { Supplier, SupplierSchema } from "../supplier.schema";
import { Client, ClientSchema } from "../client.schema";
import { Color, ColorSchema } from "../color.schema";
import { Width, WidthSchema } from "../width.schema";
import { Unit, UnitSchema } from "../unit.schema";
import { GSM, GSMSchema } from "../gsm.schema";

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([

            {
                name: Admin.name,
                schema: AdminSchema
            },
            {
                name: Menu.name,
                schema: MenuSchema
            },
            {
                name: Role.name,
                schema: RoleSchema
            },
            {
                name: Supplier.name,
                schema: SupplierSchema
            },
            {
                name: Client.name,
                schema: ClientSchema
            },
            {
                name: Color.name,
                schema: ColorSchema
            },
            {
                name: Width.name,
                schema: WidthSchema
            },
            {
                name: Unit.name,
                schema: UnitSchema
            },
            {
                name: GSM.name,
                schema: GSMSchema
            }





        ])
    ],
    exports: [MongooseModule]
})
export class SchemaLoaderModule { }