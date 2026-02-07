import { baseApi } from "../baseApi";
export interface MenuItem {
    _id: string;
    name: string;
    key: string;
    parent: string | null;
    children?: MenuItem[];
    createdAt: string;
    updatedAt: string;
}
export interface CreateMenuWithChildrenDto {
    name: string;
    key: string;
    children?: Array<{
        name: string;
        key: string;
    }>;
}
export interface UpdateMenuDto {
    name?: string;
    key?: string;
}
export const menuApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllMenu: build.query<any, void>({
            query: () => ({
                url: "/admin/menu/all",
                method: "GET",
            }),
        }),
        getMenuById: build.query<MenuItem, string>({
            query: (id) => ({
                url: `/admin/menus/${id}`,
                method: "GET"
            }),
            // providesTags: (_result, _error, id) => [{ type: 'Menu', id }]
        }),
        createMenuWithChildren: build.mutation<MenuItem, CreateMenuWithChildrenDto>({
            query: (data) => ({
                url: '/admin/menu',
                method: "POST",
                data
            }),
            // invalidatesTags: ['Menu']
        }),
        updateMenu: build.mutation<MenuItem, { id: string; data: UpdateMenuDto }>({
            query: ({ id, data }) => ({
                url: `/admin/menus/${id}`,
                method: "PATCH",
                data
            }),
            // invalidatesTags: (_result, _error, { id }) => [
            //     'Menu',
            //     { type: 'Menu', id }
            // ]
        }),
        deleteMenu: build.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/admin/menus/${id}`,
                method: "DELETE"
            }),
            // invalidatesTags: ['Menu']
        })

    }),
    // overrideExisting: false,
});

export const { useGetAllMenuQuery,
    useGetMenuByIdQuery,
    useCreateMenuWithChildrenMutation,
    useUpdateMenuMutation,
    useDeleteMenuMutation
} = menuApi;
