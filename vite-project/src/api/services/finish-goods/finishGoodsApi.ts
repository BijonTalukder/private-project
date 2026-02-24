import { baseApi } from "../baseApi";

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
            // providesTags: ['FinishGoods']
        }),

        getActiveFinishGoods: build.query<FinishGoods[], void>({
            query: () => ({
                url: '/admin/finish-goods/active',
                method: "GET"
            }),
            // providesTags: ['FinishGoods']
        }),

        searchFinishGoods: build.query<FinishGoods[], string>({
            query: (searchQuery) => ({
                url: `/admin/finish-goods/search?q=${searchQuery}`,
                method: "GET"
            }),
            // providesTags: ['FinishGoods']
        }),

        getFinishGoodsByColor: build.query<FinishGoods[], string>({
            query: (colorId) => ({
                url: `/admin/finish-goods/by-color/${colorId}`,
                method: "GET"
            }),
            // providesTags: ['FinishGoods']
        }),

        getFinishGoodsByGSM: build.query<FinishGoods[], string>({
            query: (gsmId) => ({
                url: `/admin/finish-goods/by-gsm/${gsmId}`,
                method: "GET"
            }),
            // providesTags: ['FinishGoods']
        }),

        getFinishGoodsById: build.query<FinishGoods, string>({
            query: (id) => ({
                url: `/admin/finish-goods/single/${id}`,
                method: "GET"
            }),
            // providesTags: (_result, _error, id) => [{ type: 'FinishGoods', id }]
        }),

        createFinishGoods: build.mutation<FinishGoods, CreateFinishGoodsDto>({
            query: (data) => ({
                url: '/admin/finish-goods/create',
                method: "POST",
                data
            }),
            // invalidatesTags: ['FinishGoods']
        }),

        updateFinishGoods: build.mutation<FinishGoods, { id: string; data: UpdateFinishGoodsDto }>({
            query: ({ id, data }) => ({
                url: `/admin/finish-goods/update/${id}`,
                method: "PATCH",
                data
            }),
            // invalidatesTags: (_result, _error, { id }) => [
            //     'FinishGoods',
            //     { type: 'FinishGoods', id }
            // ]
        }),

        deleteFinishGoods: build.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/admin/finish-goods/delete/${id}`,
                method: "DELETE"
            }),
            // invalidatesTags: ['FinishGoods']
        }),

        toggleFinishGoodsStatus: build.mutation<FinishGoods, string>({
            query: (id) => ({
                url: `/admin/finish-goods/${id}/toggle-status`,
                method: "PATCH"
            }),
            // invalidatesTags: ['FinishGoods']
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
