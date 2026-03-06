// Create DTO
export class CreateSupplierPurchasePriceListDto {
    supplierId: string;
    purchaseItemInfoId: string;
    currencyId: string; // ✅ Added
    purchaseRate: number;
    commission?: number; // ✅ Added (optional, default 0)
    isActive?: boolean;
    closeDate?: Date | null;
}

// Update DTO
export class UpdateSupplierPurchasePriceListDto {
    supplierId?: string;
    purchaseItemInfoId?: string;
    currencyId?: string; // ✅ Added
    purchaseRate?: number;
    commission?: number; // ✅ Added
    isActive?: boolean;
    closeDate?: Date | null;
}

// Response DTO (with populated fields)
export interface SupplierPurchasePriceListResponse {
    _id: string;
    priceListId: string;
    supplierId: {
        _id: string;
        supplierId: string;
        supplierName: string;
        phone: string;
        contactPerson?: string;
    };
    purchaseItemInfoId: {
        _id: string;
        purchaseItemId: string;
        articleNo: string;
        colorId: {
            _id: string;
            name: string;
            type: string;
        };
        gsmId: {
            _id: string;
            name: string;
        };
        unitId: {
            _id: string;
            name: string;
        };
        finishGoodsId: string;
    };
    currencyId: {
        _id: string;
        currencyId: string;
        name: string;
        type: string;
    };
    purchaseRate: number;
    commission: number;
    isActive: boolean;
    closeDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}