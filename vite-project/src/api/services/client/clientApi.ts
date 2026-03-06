import { baseApi, TAG_TYPES } from "../baseApi";

export interface Client {
    _id: string;
    clientId: string;
    name: string;
    address: string;
    contactNo: string;
    personalContactNo: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClientDto {
    name: string;
    address: string;
    contactNo: string;
    personalContactNo: string;
    email: string;
    isActive?: boolean;
}
export interface UpdateClientDto {
    name?: string;
    address?: string;
    contactNo?: string;
    personalContactNo?: string;
    email?: string;
    isActive?: boolean;
}
export const clientApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllClients: build.query<Client[], void>({
            query: () => ({
                url: '/admin/clients/all',
                method: "GET"
            }),
            providesTags: [TAG_TYPES.CLIENT]
        }),

        getActiveClients: build.query<Client[], void>({
            query: () => ({
                url: '/admin/clients/active',
                method: "GET"
            }),
            providesTags: [TAG_TYPES.CLIENT]
        }),

        searchClients: build.query<Client[], string>({
            query: (searchQuery) => ({
                url: `/admin/clients/search?q=${searchQuery}`,
                method: "GET"
            }),
            providesTags: [TAG_TYPES.CLIENT]
        }),

        getClientById: build.query<Client, string>({
            query: (id) => ({
                url: `/admin/clients/single/${id}`,
                method: "GET"
            }),
            providesTags: (_result, _error, id) => [{ type: TAG_TYPES.CLIENT, id }]
        }),

        createClient: build.mutation<Client, CreateClientDto>({
            query: (data) => ({
                url: '/admin/clients/create',
                method: "POST",
                data
            }),
            invalidatesTags: [TAG_TYPES.CLIENT]
        }),

        updateClient: build.mutation<Client, { id: string; data: UpdateClientDto }>({
            query: ({ id, data }) => ({
                url: `/admin/clients/update/${id}`,
                method: "PATCH",
                data
            }),
            invalidatesTags: (_result, _error, { id }) => [
                TAG_TYPES.CLIENT,
                { type: TAG_TYPES.CLIENT, id }
            ]
        }),

        deleteClient: build.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/admin/clients/delete/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: [TAG_TYPES.CLIENT]
        }),

        toggleClientStatus: build.mutation<Client, string>({
            query: (id) => ({
                url: `/admin/clients/${id}/toggle-status`,
                method: "PATCH"
            }),
            invalidatesTags: [TAG_TYPES.CLIENT]
        })
    })
});

export const {
    useGetAllClientsQuery,
    useGetActiveClientsQuery,
    useSearchClientsQuery,
    useGetClientByIdQuery,
    useCreateClientMutation,
    useUpdateClientMutation,
    useDeleteClientMutation,
    useToggleClientStatusMutation
} = clientApi;