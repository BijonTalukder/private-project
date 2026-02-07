import { baseApi } from "../baseApi";

export interface Supplier {
    _id: string;
    supplierId: string;
    supplierName: string;
    supplierCode?: string;
    contactPerson: string;
    phone: string;
    email: string;
    address?: string;
    gstNumber?: string;
    tinNumber?: string;
    licenseNumber?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSupplierDto {
    supplierName: string;
    supplierCode?: string;
    contactPerson: string;
    phone: string;
    email: string;
    address?: string;
    gstNumber?: string;
    tinNumber?: string;
    licenseNumber?: string;
    isActive?: boolean;
}

export interface UpdateSupplierDto {
    supplierName?: string;
    supplierCode?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    gstNumber?: string;
    tinNumber?: string;
    licenseNumber?: string;
    isActive?: boolean;
}

export const supplierApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllSuppliers: build.query<Supplier[], void>({
            query: () => ({
                url: '/admin/suppliers/all',
                method: "GET"
            }),
            // providesTags: ['Supplier']
        }),

        getActiveSuppliers: build.query<Supplier[], void>({
            query: () => ({
                url: '/admin/suppliers/active',
                method: "GET"
            }),
            // providesTags: ['Supplier']
        }),

        getSupplierById: build.query<Supplier, string>({
            query: (id) => ({
                url: `/admin/suppliers/single/${id}`,
                method: "GET"
            }),
            // providesTags: (_result, _error, id) => [{ type: 'Supplier', id }]
        }),

        createSupplier: build.mutation<Supplier, CreateSupplierDto>({
            query: (data) => ({
                url: '/admin/suppliers/create',
                method: "POST",
                data
            }),
            // invalidatesTags: ['Supplier']
        }),

        updateSupplier: build.mutation<Supplier, { id: string; data: UpdateSupplierDto }>({
            query: ({ id, data }) => ({
                url: `/admin/suppliers/update/${id}`,
                method: "PATCH",
                data
            }),
            // invalidatesTags: (_result, _error, { id }) => [
            //     'Supplier',
            //     { type: 'Supplier', id }
            // ]
        }),

        deleteSupplier: build.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/admin/suppliers/delete/${id}`,
                method: "DELETE"
            }),
            // invalidatesTags: ['Supplier']
        }),

        toggleSupplierStatus: build.mutation<Supplier, string>({
            query: (id) => ({
                url: `/admin/suppliers/${id}/toggle-status`,
                method: "PATCH"
            }),
            // invalidatesTags: ['Supplier']
        })
    })
});

export const {
    useGetAllSuppliersQuery,
    useGetActiveSuppliersQuery,
    useGetSupplierByIdQuery,
    useCreateSupplierMutation,
    useUpdateSupplierMutation,
    useDeleteSupplierMutation,
    useToggleSupplierStatusMutation
} = supplierApi;