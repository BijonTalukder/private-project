import { baseApi, TAG_TYPES } from "../baseApi";

export interface GSM {
    _id: string;
    gsmId: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateGSMDto {
    name: string;
    isActive?: boolean;
}

export interface UpdateGSMDto {
    name?: string;
    isActive?: boolean;
}
export const gsmApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllGSMs: build.query<GSM[], void>({
            query: () => ({ url: '/admin/gsm/all', method: "GET" }),
            providesTags: [TAG_TYPES.GSM]
        }),
        getActiveGSMs: build.query<GSM[], void>({
            query: () => ({ url: '/admin/gsm/active', method: "GET" }),
            providesTags: [TAG_TYPES.GSM]
        }),
        getGSMById: build.query<GSM, string>({
            query: (id) => ({ url: `/admin/gsm/single/${id}`, method: "GET" }),
            providesTags: (_result, _error, id) => [{ type: TAG_TYPES.GSM, id }]
        }),
        createGSM: build.mutation<GSM, CreateGSMDto>({
            query: (data) => ({ url: '/admin/gsm/create', method: "POST", data }),
            invalidatesTags: [TAG_TYPES.GSM]
        }),
        updateGSM: build.mutation<GSM, { id: string; data: UpdateGSMDto }>({
            query: ({ id, data }) => ({ url: `/admin/gsm/update/${id}`, method: "PATCH", data }),
            invalidatesTags: (_result, _error, { id }) => [TAG_TYPES.GSM, { type: TAG_TYPES.GSM, id }]
        }),
        deleteGSM: build.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/admin/gsm/delete/${id}`, method: "DELETE" }),
            invalidatesTags: [TAG_TYPES.GSM]
        }),
        toggleGSMStatus: build.mutation<GSM, string>({
            query: (id) => ({ url: `/admin/gsm/${id}/toggle-status`, method: "PATCH" }),
            invalidatesTags: [TAG_TYPES.GSM]
        })
    })
});
export const { useCreateGSMMutation, useGetActiveGSMsQuery, useDeleteGSMMutation, useGetAllGSMsQuery, useGetGSMByIdQuery, useToggleGSMStatusMutation, useUpdateGSMMutation } = gsmApi