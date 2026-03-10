import { baseApi, TAG_TYPES } from "../baseApi";

// Types
export interface PopulatedColor {
    _id: string;
    colorId: string;
    name: string;
    type: string;
}
export interface BulkCreateResponse {
    created: PurchaseItemInfo[];
    finishGoodsCreated: Array<{
        _id: string;
        finishGoodsId: string;
        articleNo: string;
    }>;
    errors: Array<{
        index: number;
        articleNo: string;
        message: string;
        step?: string;
    }>;
    summary: {
        total: number;
        purchaseItemsSuccess: number;
        finishGoodsSuccess: number;
        failed: number;
    };
}
export interface PopulatedUnit {
    _id: string;
    unitId: string;
    name: string;
}

export interface PopulatedWidth {
    _id: string;
    widthId: string;
    name: string;
}

export interface PopulatedGSM {
    _id: string;
    gsmId: string;
    name: string;
}

export interface PurchaseItemInfo {
    _id: string;
    purchaseItemId: string;
    articleNo: string;
    colorId: PopulatedColor;
    unitId: PopulatedUnit;
    gsmId: PopulatedGSM;
    widthId: PopulatedWidth
    isSameAsFinishGood: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePurchaseItemInfoDto {
    articleNo: string;
    colorId: string;
    unitId: string;
    gsmId: string;
    widthId: string;
    isSameAsFinishGood?: boolean;
    isActive?: boolean;
}

export interface UpdatePurchaseItemInfoDto {
    articleNo?: string;
    colorId?: string;
    unitId?: string;
    gsmId?: string;
    widthId?: string;
    isSameAsFinishGood?: boolean;
    isActive?: boolean;
}

export const purchaseItemInfoApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllPurchaseItems: build.query<PurchaseItemInfo[], void>({
            query: () => ({
                url: '/admin/purchase-item-info/all',
                method: "GET"
            }),
            providesTags: [TAG_TYPES.PURCHASE_ITEM]
        }),

        getActivePurchaseItems: build.query<PurchaseItemInfo[], void>({
            query: () => ({
                url: '/admin/purchase-item-info/active',
                method: "GET"
            }),
            providesTags: [TAG_TYPES.PURCHASE_ITEM]
        }),

        getSameAsFinishGoodItems: build.query<PurchaseItemInfo[], void>({
            query: () => ({
                url: '/admin/purchase-item-info/same-as-finish-good',
                method: "GET"
            }),
            providesTags: [TAG_TYPES.PURCHASE_ITEM]
        }),

        searchPurchaseItems: build.query<PurchaseItemInfo[], string>({
            query: (searchQuery) => ({
                url: `/admin/purchase-item-info/search?q=${searchQuery}`,
                method: "GET"
            }),
            providesTags: [TAG_TYPES.PURCHASE_ITEM]
        }),

        getPurchaseItemById: build.query<PurchaseItemInfo, string>({
            query: (id) => ({
                url: `/admin/purchase-item-info/single/${id}`,
                method: "GET"
            }),
            providesTags: (_result, _error, id) => [{ type: TAG_TYPES.PURCHASE_ITEM, id }]
        }),

        createPurchaseItem: build.mutation<PurchaseItemInfo, CreatePurchaseItemInfoDto>({
            query: (data) => ({
                url: '/admin/purchase-item-info/create',
                method: "POST",
                data
            }),
            invalidatesTags: [TAG_TYPES.PURCHASE_ITEM]
        }),
        createManyPurchaseItems: build.mutation<
            {
                created: PurchaseItemInfo[];
                errors: { index: number; articleNo: string; message: string }[];
                summary: { total: number; success: number; failed: number };
            },
            CreatePurchaseItemInfoDto[]
        >({
            query: (dtos) => ({
                url: '/admin/purchase-item-info/bulk-create',
                method: 'POST',
                data: dtos,           // ← plain array, no wrapper
            }),
            invalidatesTags: [TAG_TYPES.PURCHASE_ITEM],
        }),
        updatePurchaseItem: build.mutation<PurchaseItemInfo, { id: string; data: UpdatePurchaseItemInfoDto }>({
            query: ({ id, data }) => ({
                url: `/admin/purchase-item-info/update/${id}`,
                method: "PATCH",
                data
            }),
            invalidatesTags: (_result, _error, { id }) => [
                TAG_TYPES.PURCHASE_ITEM,
                { type: TAG_TYPES.PURCHASE_ITEM, id }
            ]
        }),

        deletePurchaseItem: build.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/admin/purchase-item-info/delete/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: [TAG_TYPES.PURCHASE_ITEM]
        }),

        togglePurchaseItemStatus: build.mutation<PurchaseItemInfo, string>({
            query: (id) => ({
                url: `/admin/purchase-item-info/${id}/toggle-status`,
                method: "PATCH"
            }),
            invalidatesTags: [TAG_TYPES.PURCHASE_ITEM]
        }),

        toggleSameAsFinishGood: build.mutation<PurchaseItemInfo, string>({
            query: (id) => ({
                url: `/admin/purchase-item-info/${id}/toggle-same-as-finish-good`,
                method: "PATCH"
            }),
            invalidatesTags: [TAG_TYPES.PURCHASE_ITEM]
        })
    })
});

export const {
    useGetAllPurchaseItemsQuery,
    useGetActivePurchaseItemsQuery,
    useGetSameAsFinishGoodItemsQuery,
    useSearchPurchaseItemsQuery,
    useGetPurchaseItemByIdQuery,
    useCreatePurchaseItemMutation,
    useUpdatePurchaseItemMutation,
    useDeletePurchaseItemMutation,
    useTogglePurchaseItemStatusMutation,
    useToggleSameAsFinishGoodMutation,
    useCreateManyPurchaseItemsMutation
} = purchaseItemInfoApi;