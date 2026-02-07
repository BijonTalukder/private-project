import type { CreateRoleDto, Role, UpdateRoleDto } from "../admin/adminApi";
import { baseApi } from "../baseApi";

export const roleApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // ============ ROLE ENDPOINTS ============

        getAllRoles: build.query<Role[], void>({
            query: () => ({
                url: '/admin/roles/all',
                method: "GET"
            }),
            // providesTags: ['Role']
        }),

        getRoleById: build.query<Role, string>({
            query: (id) => ({
                url: `/admin/roles/${id}`,
                method: "GET"
            }),
            // providesTags: (_result, _error, id) => [{ type: 'Role', id }]
        }),

        createRole: build.mutation<Role, CreateRoleDto>({
            query: (data) => ({
                url: '/admin/roles/create',
                method: "POST",
                data
            }),
            // invalidatesTags: ['Role']
        }),

        updateRole: build.mutation<Role, { id: string; data: UpdateRoleDto }>({
            query: ({ id, data }) => ({
                url: `/admin/roles/update/${id}`,
                method: "PATCH",
                data
            }),
            // invalidatesTags: (_result, _error, { id }) => [
            //     'Role',
            //     { type: 'Role', id }
            // ]
        }),

        deleteRole: build.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/admin/roles/delete/${id}`,
                method: "DELETE"
            }),
            // invalidatesTags: ['Role']
        })
    })
})

export const { useCreateRoleMutation, useGetAllRolesQuery, useGetRoleByIdQuery, useDeleteRoleMutation, useUpdateRoleMutation } = roleApi