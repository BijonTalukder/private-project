import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateMenuWithChildrenDto } from "src/lib/dtos/menu.dto";
import { Menu } from "src/lib/schemas/menu.schema";

@Injectable()
export class MenuService {
    constructor(

        @InjectModel(Menu.name)
        private readonly menuModel: Model<Menu>
    ) {


    }
    async createWithChildren(dto: CreateMenuWithChildrenDto) {

        const isDuplicate = await this.menuModel.findOne({ key: dto.key })
        if (isDuplicate)
            throw new BadRequestException("already exist same key")


        if (dto.parent) {
            const submenu = await this.menuModel.create({
                name: dto.name,
                key: dto.key,
                parent: new Types.ObjectId(dto.parent),
            });

            return submenu;
        }
        // create parent
        const parentMenu = await this.menuModel.create({
            name: dto.name,
            key: dto.key,

        });

        // create children
        if (dto.children?.length) {
            const childrenDocs = dto.children.map((child) => ({
                name: child.name,
                key: child.key,
                parent: parentMenu._id,
            }));

            await this.menuModel.insertMany(childrenDocs);
        }

        return parentMenu;
    }


    async findAll() {
        return this.menuModel.aggregate([
            {
                $match: { parent: null },
            },
            {
                $lookup: {
                    from: 'menus',
                    localField: '_id',
                    foreignField: 'parent',
                    as: 'children',
                },
            },
            {
                $sort: { createdAt: 1 },
            },
        ]);
    }

    async findOne(id: string) {
        const menu = await this.menuModel.findById(id);
        if (!menu) throw new NotFoundException('Menu not found');
        return menu;
    }

    async update(id: string, body: Partial<Menu>) {
        const updated = await this.menuModel.findByIdAndUpdate(
            id,
            body,
            { new: true },
        );

        if (!updated) throw new NotFoundException('Menu not found');
        return updated;
    }
    async delete(id: string) {
        const menu = await this.menuModel.findById(id);
        if (!menu) throw new NotFoundException('Menu not found');

        // delete children first
        await this.menuModel.deleteMany({ parent: new Types.ObjectId(id) });

        // delete parent
        await this.menuModel.findByIdAndDelete(id);

        return { message: 'Menu deleted successfully' };
    }
}