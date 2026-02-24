import { baseApi } from "../baseApi";

// Types
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

export interface PurchaseItemInfo {
    _id: string;
    purchaseItemId: string;
    articleNo: string;
    colorId: PopulatedColor;
    unitId: PopulatedUnit;
    gsmId: PopulatedGSM;
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
    isSameAsFinishGood?: boolean;
    isActive?: boolean;
}

export interface UpdatePurchaseItemInfoDto {
    articleNo?: string;
    colorId?: string;
    unitId?: string;
    gsmId?: string;
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
            // providesTags: ['PurchaseItemInfo']
        }),

        getActivePurchaseItems: build.query<PurchaseItemInfo[], void>({
            query: () => ({
                url: '/admin/purchase-item-info/active',
                method: "GET"
            }),
            // providesTags: ['PurchaseItemInfo']
        }),

        getSameAsFinishGoodItems: build.query<PurchaseItemInfo[], void>({
            query: () => ({
                url: '/admin/purchase-item-info/same-as-finish-good',
                method: "GET"
            }),
            // providesTags: ['PurchaseItemInfo']
        }),

        searchPurchaseItems: build.query<PurchaseItemInfo[], string>({
            query: (searchQuery) => ({
                url: `/admin/purchase-item-info/search?q=${searchQuery}`,
                method: "GET"
            }),
            // providesTags: ['PurchaseItemInfo']
        }),

        getPurchaseItemById: build.query<PurchaseItemInfo, string>({
            query: (id) => ({
                url: `/admin/purchase-item-info/single/${id}`,
                method: "GET"
            }),
            // providesTags: (_result, _error, id) => [{ type: 'PurchaseItemInfo', id }]
        }),

        createPurchaseItem: build.mutation<PurchaseItemInfo, CreatePurchaseItemInfoDto>({
            query: (data) => ({
                url: '/admin/purchase-item-info/create',
                method: "POST",
                data
            }),
            // invalidatesTags: ['PurchaseItemInfo']
        }),

        updatePurchaseItem: build.mutation<PurchaseItemInfo, { id: string; data: UpdatePurchaseItemInfoDto }>({
            query: ({ id, data }) => ({
                url: `/admin/purchase-item-info/update/${id}`,
                method: "PATCH",
                data
            }),
            // invalidatesTags: (_result, _error, { id }) => [
            //     'PurchaseItemInfo',
            //     { type: 'PurchaseItemInfo', id }
            // ]
        }),

        deletePurchaseItem: build.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/admin/purchase-item-info/delete/${id}`,
                method: "DELETE"
            }),
            // invalidatesTags: ['PurchaseItemInfo']
        }),

        togglePurchaseItemStatus: build.mutation<PurchaseItemInfo, string>({
            query: (id) => ({
                url: `/admin/purchase-item-info/${id}/toggle-status`,
                method: "PATCH"
            }),
            // invalidatesTags: ['PurchaseItemInfo']
        }),

        toggleSameAsFinishGood: build.mutation<PurchaseItemInfo, string>({
            query: (id) => ({
                url: `/admin/purchase-item-info/${id}/toggle-same-as-finish-good`,
                method: "PATCH"
            }),
            // invalidatesTags: ['PurchaseItemInfo']
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
    useToggleSameAsFinishGoodMutation
} = purchaseItemInfoApi;