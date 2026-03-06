import { baseApi, TAG_TYPES } from "../baseApi";

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
            query: () => ({ url: '/admin/units/all', method: "GET" }),
            providesTags: [TAG_TYPES.UNIT]
        }),
        getActiveUnits: build.query<Unit[], void>({
            query: () => ({ url: '/admin/units/active', method: "GET" }),
            providesTags: [TAG_TYPES.UNIT]
        }),
        getUnitById: build.query<Unit, string>({
            query: (id) => ({ url: `/admin/units/single/${id}`, method: "GET" }),
            providesTags: (_result, _error, id) => [{ type: TAG_TYPES.UNIT, id }]
        }),
        createUnit: build.mutation<Unit, CreateUnitDto>({
            query: (data) => ({ url: '/admin/units/create', method: "POST", data }),
            invalidatesTags: [TAG_TYPES.UNIT]
        }),
        updateUnit: build.mutation<Unit, { id: string; data: UpdateUnitDto }>({
            query: ({ id, data }) => ({ url: `/admin/units/update/${id}`, method: "PATCH", data }),
            invalidatesTags: (_result, _error, { id }) => [TAG_TYPES.UNIT, { type: TAG_TYPES.UNIT, id }]
        }),
        deleteUnit: build.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/admin/units/delete/${id}`, method: "DELETE" }),
            invalidatesTags: [TAG_TYPES.UNIT]
        }),
        toggleUnitStatus: build.mutation<Unit, string>({
            query: (id) => ({ url: `/admin/units/${id}/toggle-status`, method: "PATCH" }),
            invalidatesTags: [TAG_TYPES.UNIT]
        })
    })
});
export const { useCreateUnitMutation, useDeleteUnitMutation, useGetActiveUnitsQuery, useGetAllUnitsQuery, useGetUnitByIdQuery, useUpdateUnitMutation, useToggleUnitStatusMutation } = unitApi