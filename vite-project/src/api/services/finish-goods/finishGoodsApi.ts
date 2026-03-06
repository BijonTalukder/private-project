import { baseApi, TAG_TYPES } from "../baseApi";

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

export interface FinishGoods {
    _id: string;
    finishGoodsId: string;
    articleNo: string;
    colorId: PopulatedColor;
    unitId: PopulatedUnit;
    gsmId: PopulatedGSM;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFinishGoodsDto {
    articleNo: string;
    colorId: string;
    unitId: string;
    gsmId: string;
    isActive?: boolean;
}

export interface UpdateFinishGoodsDto {
    articleNo?: string;
    colorId?: string;
    unitId?: string;
    gsmId?: string;
    isActive?: boolean;
}
export const finishGoodsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllFinishGoods: build.query<FinishGoods[], void>({
            query: () => ({
                url: '/admin/finish-goods/all',
                method: "GET"
            }),
            providesTags: [TAG_TYPES.FINISH_GOODS]
        }),

        getActiveFinishGoods: build.query<FinishGoods[], void>({
            query: () => ({
                url: '/admin/finish-goods/active',
                method: "GET"
            }),
            providesTags: [TAG_TYPES.FINISH_GOODS]
        }),

        searchFinishGoods: build.query<FinishGoods[], string>({
            query: (searchQuery) => ({
                url: `/admin/finish-goods/search?q=${searchQuery}`,
                method: "GET"
            }),
            providesTags: [TAG_TYPES.FINISH_GOODS]
        }),

        getFinishGoodsByColor: build.query<FinishGoods[], string>({
            query: (colorId) => ({
                url: `/admin/finish-goods/by-color/${colorId}`,
                method: "GET"
            }),
            providesTags: [TAG_TYPES.FINISH_GOODS]
        }),

        getFinishGoodsByGSM: build.query<FinishGoods[], string>({
            query: (gsmId) => ({
                url: `/admin/finish-goods/by-gsm/${gsmId}`,
                method: "GET"
            }),
            providesTags: [TAG_TYPES.FINISH_GOODS]
        }),

        getFinishGoodsById: build.query<FinishGoods, string>({
            query: (id) => ({
                url: `/admin/finish-goods/single/${id}`,
                method: "GET"
            }),
            providesTags: (_result, _error, id) => [{ type: TAG_TYPES.FINISH_GOODS, id }]
        }),

        createFinishGoods: build.mutation<FinishGoods, CreateFinishGoodsDto>({
            query: (data) => ({
                url: '/admin/finish-goods/create',
                method: "POST",
                data
            }),
            invalidatesTags: [TAG_TYPES.FINISH_GOODS]
        }),

        updateFinishGoods: build.mutation<FinishGoods, { id: string; data: UpdateFinishGoodsDto }>({
            query: ({ id, data }) => ({
                url: `/admin/finish-goods/update/${id}`,
                method: "PATCH",
                data
            }),
            invalidatesTags: (_result, _error, { id }) => [
                TAG_TYPES.FINISH_GOODS,
                { type: TAG_TYPES.FINISH_GOODS, id }
            ]
        }),

        deleteFinishGoods: build.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/admin/finish-goods/delete/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: [TAG_TYPES.FINISH_GOODS]
        }),

        toggleFinishGoodsStatus: build.mutation<FinishGoods, string>({
            query: (id) => ({
                url: `/admin/finish-goods/${id}/toggle-status`,
                method: "PATCH"
            }),
            invalidatesTags: [TAG_TYPES.FINISH_GOODS]
        })
    })
});

export const {
    useGetAllFinishGoodsQuery,
    useGetActiveFinishGoodsQuery,
    useSearchFinishGoodsQuery,
    useGetFinishGoodsByColorQuery,
    useGetFinishGoodsByGSMQuery,
    useGetFinishGoodsByIdQuery,
    useCreateFinishGoodsMutation,
    useUpdateFinishGoodsMutation,
    useDeleteFinishGoodsMutation,
    useToggleFinishGoodsStatusMutation
} = finishGoodsApi;
