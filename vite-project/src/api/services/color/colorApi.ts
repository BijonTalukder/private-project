import { baseApi } from "../baseApi";

export interface Color {
    _id: string;
    colorId: string;
    name: string;
    type: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateColorDto {
    name: string;
    type: string;
    isActive?: boolean;
}

export interface UpdateColorDto {
    name?: string;
    type?: string;
    isActive?: boolean;
}

export const colorApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllColors: build.query<Color[], void>({
            query: () => ({ url: '/admin/colors/all', method: "GET" }),
            // providesTags: ['Color']
        }),
        getActiveColors: build.query<Color[], void>({
            query: () => ({ url: '/admin/colors/active', method: "GET" }),
            // providesTags: ['Color']
        }),
        getColorById: build.query<Color, string>({
            query: (id) => ({ url: `/admin/colors/single/${id}`, method: "GET" }),
            // providesTags: (_result, _error, id) => [{ type: 'Color', id }]
        }),
        createColor: build.mutation<Color, CreateColorDto>({
            query: (data) => ({ url: '/admin/colors/create', method: "POST", data }),
            // invalidatesTags: ['Color']
        }),
        updateColor: build.mutation<Color, { id: string; data: UpdateColorDto }>({
            query: ({ id, data }) => ({ url: `/admin/colors/update/${id}`, method: "PATCH", data }),
            // invalidatesTags: (_result, _error, { id }) => ['Color', { type: 'Color', id }]
        }),
        deleteColor: build.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/admin/colors/delete/${id}`, method: "DELETE" }),
            // invalidatesTags: ['Color']
        }),
        toggleColorStatus: build.mutation<Color, string>({
            query: (id) => ({ url: `/admin/colors/${id}/toggle-status`, method: "PATCH" }),
            // invalidatesTags: ['Color']
        })
    })
});

export const { useCreateColorMutation, useDeleteColorMutation, useGetActiveColorsQuery, useGetAllColorsQuery, useGetColorByIdQuery, useToggleColorStatusMutation, useUpdateColorMutation } = colorApi