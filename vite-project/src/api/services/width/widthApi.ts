import { baseApi, TAG_TYPES } from "../baseApi";

export interface Width {
    _id: string;
    widthId: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWidthDto {
    name: string;
    isActive?: boolean;
}

export interface UpdateWidthDto {
    name?: string;
    isActive?: boolean;
}
export const widthApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllWidths: build.query<Width[], void>({
            query: () => ({ url: '/admin/widths/all', method: "GET" }),
            providesTags: [TAG_TYPES.WIDTH]
        }),
        getActiveWidths: build.query<Width[], void>({
            query: () => ({ url: '/widths/active', method: "GET" }),
            providesTags: [TAG_TYPES.WIDTH]
        }),
        getWidthById: build.query<Width, string>({
            query: (id) => ({ url: `/admin/widths/single/${id}`, method: "GET" }),
            providesTags: (_result, _error, id) => [{ type: TAG_TYPES.WIDTH, id }]
        }),
        createWidth: build.mutation<Width, CreateWidthDto>({
            query: (data) => ({ url: '/admin/widths/create', method: "POST", data }),
            invalidatesTags: [TAG_TYPES.WIDTH]
        }),
        updateWidth: build.mutation<Width, { id: string; data: UpdateWidthDto }>({
            query: ({ id, data }) => ({ url: `/admin/widths/update/${id}`, method: "PATCH", data }),
            invalidatesTags: (_result, _error, { id }) => [TAG_TYPES.WIDTH, { type: TAG_TYPES.WIDTH, id }]
        }),
        deleteWidth: build.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/admin/widths/delete/${id}`, method: "DELETE" }),
            invalidatesTags: [TAG_TYPES.WIDTH]
        }),
        toggleWidthStatus: build.mutation<Width, string>({
            query: (id) => ({ url: `/widths/${id}/toggle-status`, method: "PATCH" }),
            invalidatesTags: [TAG_TYPES.WIDTH]
        })
    })
});

export const { useCreateWidthMutation, useDeleteWidthMutation, useGetActiveWidthsQuery, useGetAllWidthsQuery, useGetWidthByIdQuery, useToggleWidthStatusMutation, useUpdateWidthMutation } = widthApi