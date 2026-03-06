import { baseApi, TAG_TYPES } from "../baseApi";

export interface MenuItem {
    _id: string;
    name: string;
    key: string;
    parent: string | null;
    level: number;
    order: number;
    children?: MenuItem[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateMenuDto {
    name: string;
    key: string;
    parent?: string | null;
    order?: number;
}

export interface UpdateMenuDto {
    name?: string;
    key?: string;
    parent?: string | null;
    order?: number;
}

export const menuApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllMenus: build.query<MenuItem[], void>({
            query: () => ({ url: '/admin/menus/all', method: 'GET' }),
            providesTags: [TAG_TYPES.MENU],
        }),
        getMenuById: build.query<MenuItem, string>({
            query: (id) => ({ url: `/admin/menus/single/${id}`, method: 'GET' }),
            providesTags: (_r, _e, id) => [{ type: TAG_TYPES.MENU, id }],
        }),
        createMenu: build.mutation<MenuItem, CreateMenuDto>({
            query: (data) => ({ url: '/admin/menus', method: 'POST', data }),
            invalidatesTags: [TAG_TYPES.MENU],
        }),
        updateMenu: build.mutation<MenuItem, { id: string; data: UpdateMenuDto }>({
            query: ({ id, data }) => ({ url: `/admin/menus/update/${id}`, method: 'PATCH', data }),
            invalidatesTags: [TAG_TYPES.MENU],
        }),
        deleteMenu: build.mutation<{ message: string; deletedCount: number }, string>({
            query: (id) => ({ url: `/admin/menus/delete/${id}`, method: 'DELETE' }),
            invalidatesTags: [TAG_TYPES.MENU],
        }),
    }),
});

export const {
    useGetAllMenusQuery,
    useGetMenuByIdQuery,
    useCreateMenuMutation,
    useUpdateMenuMutation,
    useDeleteMenuMutation,
} = menuApi;