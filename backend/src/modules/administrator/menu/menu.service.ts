import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateMenuDto, UpdateMenuDto } from 'src/lib/dtos/menu.dto';
import { Menu } from 'src/lib/schemas/menu.schema';


@Injectable()
export class MenuService {
    constructor(@InjectModel(Menu.name) private menuModel: Model<Menu>) { }

    /**
     * Create menu
     */
    async create(dto: CreateMenuDto) {
        // Calculate level based on parent
        let level = 0;
        if (dto.parent) {
            const parentMenu = await this.menuModel.findById(dto.parent);
            if (!parentMenu) throw new NotFoundException('Parent menu not found');
            level = parentMenu.level + 1;
        }

        const menu = await this.menuModel.create({
            ...dto,
            level,
        });

        return menu;
    }

    /**
     * Get all menus as nested tree (recursive)
     */
    async findAllNested(): Promise<any[]> {
        // Get all menus sorted by order
        const allMenus = await this.menuModel.find().sort({ order: 1 }).lean();

        // Build tree recursively
        const buildTree = (parentId: any = null): any[] => {
            return allMenus
                .filter((menu) =>
                    parentId === null
                        ? menu.parent === null || menu.parent === undefined
                        : menu.parent?.toString() === parentId.toString()
                )
                .map((menu) => ({
                    ...menu,
                    children: buildTree(menu._id),
                }));
        };

        return buildTree(null);
    }

    /**
     * Get menu by ID
     */
    async findOne(id: string) {
        const menu = await this.menuModel.findById(id).populate('parent');
        if (!menu) throw new NotFoundException('Menu not found');
        return menu;
    }

    /**
     * Get children of a menu (one level)
     */
    async findChildren(parentId: string) {
        return this.menuModel.find({ parent: parentId }).sort({ order: 1 });
    }

    /**
     * Get all descendants recursively
     */
    async findAllDescendants(parentId: string): Promise<string[]> {
        const children = await this.menuModel.find({ parent: parentId });
        let descendants = children.map((c) => c._id.toString());

        for (const child of children) {
            const childDescendants = await this.findAllDescendants(child._id.toString());
            descendants = [...descendants, ...childDescendants];
        }

        return descendants;
    }

    /**
     * Update menu
     */
    async update(id: string, dto: UpdateMenuDto) {
        const menu = await this.menuModel.findById(id);
        if (!menu) throw new NotFoundException('Menu not found');

        // If parent is changing, recalculate level
        if (dto.parent !== undefined && dto.parent !== menu.parent?.toString()) {
            if (dto.parent) {
                // Check if new parent exists
                const parentMenu = await this.menuModel.findById(dto.parent);
                if (!parentMenu) throw new NotFoundException('Parent menu not found');

                // Prevent circular reference
                if (dto.parent === id) {
                    throw new BadRequestException('Menu cannot be its own parent');
                }

                // Check if trying to move under its own descendant
                const descendants = await this.findAllDescendants(id);
                if (descendants.includes(dto.parent)) {
                    throw new BadRequestException('Cannot move menu under its own descendant');
                }

                dto.level = parentMenu.level + 1;
            } else {
                dto.level = 0;
            }
        }

        return this.menuModel.findByIdAndUpdate(id, dto, { new: true });
    }

    /**
     * Delete menu and all descendants
     */
    async delete(id: string) {
        const menu = await this.menuModel.findById(id);
        if (!menu) throw new NotFoundException('Menu not found');

        // Get all descendants
        const descendants = await this.findAllDescendants(id);

        // Delete all descendants
        if (descendants.length > 0) {
            await this.menuModel.deleteMany({ _id: { $in: descendants } });
        }

        // Delete the menu itself
        await this.menuModel.findByIdAndDelete(id);

        return {
            message: 'Menu deleted successfully',
            deletedCount: descendants.length + 1,
        };
    }

    /**
     * Reorder menus
     */
    async reorder(items: { id: string; order: number }[]) {
        const updates = items.map((item) =>
            this.menuModel.findByIdAndUpdate(item.id, { order: item.order })
        );
        await Promise.all(updates);
        return { message: 'Menus reordered successfully' };
    }
}