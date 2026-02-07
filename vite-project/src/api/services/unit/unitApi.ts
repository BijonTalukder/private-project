import { baseApi } from "../baseApi";

export interface Unit {
    _id: string;
    unitId: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUnitDto {
    name: string;
    isActive?: boolean;
}

export interface UpdateUnitDto {
    name?: string;
    isActive?: boolean;
}

export const unitApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllUnits: build.query<Unit[], void>({
            query: () => ({ url: '/admin/units/al', method: "GET" }),
            // providesTags: ['Unit']
        }),
        getActiveUnits: build.query<Unit[], void>({
            query: () => ({ url: '/admin/units/active', method: "GET" }),
            // providesTags: ['Unit']
        }),
        getUnitById: build.query<Unit, string>({
            query: (id) => ({ url: `/admin/units/single/${id}`, method: "GET" }),
            // providesTags: (_result, _error, id) => [{ type: 'Unit', id }]
        }),
        createUnit: build.mutation<Unit, CreateUnitDto>({
            query: (data) => ({ url: '/admin/units/create', method: "POST", data }),
            // invalidatesTags: ['Unit']
        }),
        updateUnit: build.mutation<Unit, { id: string; data: UpdateUnitDto }>({
            query: ({ id, data }) => ({ url: `/admin/units/update/${id}`, method: "PATCH", data }),
            // invalidatesTags: (_result, _error, { id }) => ['Unit', { type: 'Unit', id }]
        }),
        deleteUnit: build.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/admin/units/delete/${id}`, method: "DELETE" }),
            // invalidatesTags: ['Unit']
        }),
        toggleUnitStatus: build.mutation<Unit, string>({
            query: (id) => ({ url: `/admin/units/${id}/toggle-status`, method: "PATCH" }),
            // invalidatesTags: ['Unit']
        })
    })
});
export const { useCreateUnitMutation, useDeleteUnitMutation, useGetActiveUnitsQuery, useGetAllUnitsQuery, useGetUnitByIdQuery, useUpdateUnitMutation, useToggleUnitStatusMutation } = unitApi