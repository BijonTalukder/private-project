import { baseApi } from "../baseApi";

export interface Permission {
    menuId: string;
    menuName: string;
    menuKey: string;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
}

export interface Role {
    _id: string;
    name: string;
    permissions: Permission[];
    createdAt: string;
    updatedAt: string;
}

export interface Admin {
    _id: string;
    email: string;
    role: Role;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAdminDto {
    email: string;
    password: string;
    role: string;
    isActive?: boolean;
}

export interface UpdateAdminDto {
    email?: string;
    password?: string;
    role?: string;
    isActive?: boolean;
}

export interface CreateRoleDto {
    name: string;
    permissions: Permission[];
}

export interface UpdateRoleDto {
    name?: string;
    permissions?: Permission[];
}
export const adminApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // ============ ADMIN ENDPOINTS ============

        getAllAdmins: build.query<Admin[], void>({
            query: () => ({
                url: '/admin/all',
                method: "GET"
            }),
            // providesTags: ['Admin']
        }),

        getAdminById: build.query<Admin, string>({
            query: (id) => ({
                url: `/admin/single/${id}`,
                method: "GET"
            }),
            // providesTags: (_result, _error, id) => [{ type: 'Admin', id }]
        }),

        createAdmin: build.mutation<Admin, CreateAdminDto>({
            query: (data) => ({
                url: '/admin/create',
                method: "POST",
                data
            }),
            // invalidatesTags: ['Admin']
        }),

        updateAdmin: build.mutation<Admin, { id: string; data: UpdateAdminDto }>({
            query: ({ id, data }) => ({
                url: `/admin/update/${id}`,
                method: "PATCH",
                data
            }),
            // invalidatesTags: (_result, _error, { id }) => [
            //     'Admin',
            //     { type: 'Admin', id }
            // ]
        }),

        deleteAdmin: build.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/admin/delete/${id}`,
                method: "DELETE"
            }),
            // invalidatesTags: ['Admin']
        }),

        toggleAdminStatus: build.mutation<Admin, string>({
            query: (id) => ({
                url: `/admin/admins/${id}/toggle-status`,
                method: "PATCH"
            }),
            // invalidatesTags: ['Admin']
        }),


    })
});

export const {
    // Admin hooks
    useGetAllAdminsQuery,
    useGetAdminByIdQuery,
    useCreateAdminMutation,
    useUpdateAdminMutation,
    useDeleteAdminMutation,
    useToggleAdminStatusMutation,

    // Role hooks
    // useGetAllRolesQuery,
    // useGetRoleByIdQuery,
    // useCreateRoleMutation,
    // useUpdateRoleMutation,
    // useDeleteRoleMutation
} = adminApi;
