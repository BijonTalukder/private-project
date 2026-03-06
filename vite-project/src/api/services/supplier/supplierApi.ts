import { baseApi, TAG_TYPES } from "../baseApi";

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
            providesTags: [TAG_TYPES.SUPPLIER]
        }),

        getActiveSuppliers: build.query<Supplier[], void>({
            query: () => ({
                url: '/admin/suppliers/active',
                method: "GET"
            }),
            providesTags: [TAG_TYPES.SUPPLIER]
        }),

        getSupplierById: build.query<Supplier, string>({
            query: (id) => ({
                url: `/admin/suppliers/single/${id}`,
                method: "GET"
            }),
            providesTags: (_result, _error, id) => [{ type: TAG_TYPES.SUPPLIER, id }]
        }),

        createSupplier: build.mutation<Supplier, CreateSupplierDto>({
            query: (data) => ({
                url: '/admin/suppliers/create',
                method: "POST",
                data
            }),
            invalidatesTags: [TAG_TYPES.SUPPLIER]
        }),

        updateSupplier: build.mutation<Supplier, { id: string; data: UpdateSupplierDto }>({
            query: ({ id, data }) => ({
                url: `/admin/suppliers/update/${id}`,
                method: "PATCH",
                data
            }),
            invalidatesTags: (_result, _error, { id }) => [
                TAG_TYPES.SUPPLIER,
                { type: TAG_TYPES.SUPPLIER, id }
            ]
        }),

        deleteSupplier: build.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/admin/suppliers/delete/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: [TAG_TYPES.SUPPLIER]
        }),

        toggleSupplierStatus: build.mutation<Supplier, string>({
            query: (id) => ({
                url: `/admin/suppliers/${id}/toggle-status`,
                method: "PATCH"
            }),
            invalidatesTags: [TAG_TYPES.SUPPLIER]
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