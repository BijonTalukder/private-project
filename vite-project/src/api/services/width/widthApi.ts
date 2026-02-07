import { baseApi } from "../baseApi";

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
            // providesTags: ['Width']
        }),
        getActiveWidths: build.query<Width[], void>({
            query: () => ({ url: '/widths/active', method: "GET" }),
            // providesTags: ['Width']
        }),
        getWidthById: build.query<Width, string>({
            query: (id) => ({ url: `/admin/widths/single/${id}`, method: "GET" }),
            // providesTags: (_result, _error, id) => [{ type: 'Width', id }]
        }),
        createWidth: build.mutation<Width, CreateWidthDto>({
            query: (data) => ({ url: '/admin/widths/create', method: "POST", data }),
            // invalidatesTags: ['Width']
        }),
        updateWidth: build.mutation<Width, { id: string; data: UpdateWidthDto }>({
            query: ({ id, data }) => ({ url: `/admin/widths/update/${id}`, method: "PATCH", data }),
            // invalidatesTags: (_result, _error, { id }) => ['Width', { type: 'Width', id }]
        }),
        deleteWidth: build.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/admin/widths/delete/${id}`, method: "DELETE" }),
            // invalidatesTags: ['Width']
        }),
        toggleWidthStatus: build.mutation<Width, string>({
            query: (id) => ({ url: `/widths/${id}/toggle-status`, method: "PATCH" }),
            // invalidatesTags: ['Width']
        })
    })
});

export const { useCreateWidthMutation, useDeleteWidthMutation, useGetActiveWidthsQuery, useGetAllWidthsQuery, useGetWidthByIdQuery, useToggleWidthStatusMutation, useUpdateWidthMutation } = widthApi