import { baseApi, TAG_TYPES } from "../baseApi";

export interface PopulatedSupplier {
    _id: string;
    supplierId: string;
    supplierName: string;
    contactPerson: string;
    phone: string;
}

export interface PopulatedColor {
    _id: string;
    colorId: string;
    name: string;
    type: string;
}

export interface PopulatedUnit {
    _id: string;
    unitId: string;
    name: string;
}

export interface PopulatedGSM {
    _id: string;
    gsmId: string;
    name: string;
}

export interface PopulatedPurchaseItemInfo {
    _id: string;
    purchaseItemId: string;
    articleNo: string;
    colorId: PopulatedColor;
    unitId: PopulatedUnit;
    gsmId: PopulatedGSM;
}
export interface currency {
    _id: string;
    name: string;
    type: string;
}
export interface SupplierPurchasePriceList {
    _id: string;
    priceListId: string;
    supplierId: PopulatedSupplier;
    purchaseItemInfoId: PopulatedPurchaseItemInfo;
    purchaseRate: number;
    commission: number;
    currencyId: currency
    isActive: boolean;
    closeDate: string | null;
    createdAt: string;
    updatedAt: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreateSupplierPurchasePriceListDto {
    supplierId: string;
    purchaseItemInfoId: string;
    purchaseRate: number;
    isActive?: boolean;
    closeDate?: string | null;
}

export interface UpdateSupplierPurchasePriceListDto {
    supplierId?: string;
    purchaseItemInfoId?: string;
    purchaseRate?: number;
    isActive?: boolean;
    closeDate?: string | null;
}

// ─── API ──────────────────────────────────────────────────────────────────────
export const supplierPurchasePriceListApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllPriceLists: build.query<SupplierPurchasePriceList[], void>({
            query: () => ({ url: '/admin/supplier-purchase-price-list/all', method: 'GET' }),
            providesTags: [TAG_TYPES.SUPPLIER_PURCHASE_PRICE],
        }),

        getActivePriceLists: build.query<SupplierPurchasePriceList[], void>({
            query: () => ({ url: '/admin/supplier-purchase-price-list/active', method: 'GET' }),
            providesTags: [TAG_TYPES.SUPPLIER_PURCHASE_PRICE],
        }),

        getPriceListsBySupplier: build.query<SupplierPurchasePriceList[], string>({
            query: (supplierId) => ({
                url: `/admin/supplier-purchase-price-list/by-supplier/${supplierId}`,
                method: 'GET',
            }),
            providesTags: [TAG_TYPES.SUPPLIER_PURCHASE_PRICE],
        }),

        getPriceListsByPurchaseItem: build.query<SupplierPurchasePriceList[], string>({
            query: (purchaseItemInfoId) => ({
                url: `/admin/supplier-purchase-price-list/by-purchase-item/${purchaseItemInfoId}`,
                method: 'GET',
            }),
            providesTags: [TAG_TYPES.SUPPLIER_PURCHASE_PRICE],
        }),

        getPriceListById: build.query<SupplierPurchasePriceList, string>({
            query: (id) => ({ url: `/admin/supplier-purchase-price-list/single/${id}`, method: 'GET' }),
            providesTags: (_r, _e, id) => [{ type: TAG_TYPES.SUPPLIER_PURCHASE_PRICE, id }],
        }),

        createPriceList: build.mutation<SupplierPurchasePriceList, CreateSupplierPurchasePriceListDto>({
            query: (data) => ({ url: '/admin/supplier-purchase-price-list/create', method: 'POST', data }),
            invalidatesTags: [TAG_TYPES.SUPPLIER_PURCHASE_PRICE],
        }),

        updatePriceList: build.mutation<
            SupplierPurchasePriceList,
            { id: string; data: UpdateSupplierPurchasePriceListDto }
        >({
            query: ({ id, data }) => ({
                url: `/admin/supplier-purchase-price-list/update/${id}`,
                method: 'PATCH',
                data,
            }),
            invalidatesTags: (_r, _e, { id }) => [
                TAG_TYPES.SUPPLIER_PURCHASE_PRICE,
                { type: TAG_TYPES.SUPPLIER_PURCHASE_PRICE, id },
            ],
        }),

        deletePriceList: build.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/admin/supplier-purchase-price-list/delete/${id}`, method: 'DELETE' }),
            invalidatesTags: [TAG_TYPES.SUPPLIER_PURCHASE_PRICE],
        }),

        togglePriceListStatus: build.mutation<SupplierPurchasePriceList, string>({
            query: (id) => ({
                url: `/supplier-purchase-price-list/${id}/toggle-status`,
                method: 'PATCH',
            }),
            invalidatesTags: [TAG_TYPES.SUPPLIER_PURCHASE_PRICE],
        }),

        setPriceListCloseDate: build.mutation<
            SupplierPurchasePriceList,
            { id: string; closeDate: string | null }
        >({
            query: ({ id, closeDate }) => ({
                url: `/supplier-purchase-price-list/${id}/set-close-date`,
                method: 'PATCH',
                data: { closeDate },
            }),
            invalidatesTags: [TAG_TYPES.SUPPLIER_PURCHASE_PRICE],
        }),
    }),
});

export const {
    useGetAllPriceListsQuery,
    useGetActivePriceListsQuery,
    useGetPriceListsBySupplierQuery,
    useGetPriceListsByPurchaseItemQuery,
    useGetPriceListByIdQuery,
    useCreatePriceListMutation,
    useUpdatePriceListMutation,
    useDeletePriceListMutation,
    useTogglePriceListStatusMutation,
    useSetPriceListCloseDateMutation,
} = supplierPurchasePriceListApi;