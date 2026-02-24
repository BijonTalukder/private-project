import { baseApi } from "../baseApi";


// ─── Nested Types ─────────────────────────────────────────────────────────────
export interface PopulatedClient {
    _id: string;
    clientId: string;
    name: string;
    contactNo: string;
    email: string;
}

export interface PopulatedCurrency {
    _id: string;
    currencyId: string;
    name: string;
    type: string;
}

export interface PopulatedPayment {
    _id: string;
    paymentId: string;
    name: string;
    type: string;
}

export interface PopulatedBank {
    _id: string;
    bankId: string;
    name: string;
    accountName: string;
    branchName: string;
    code: string;
}

export interface PopulatedFinishGoods {
    _id: string;
    finishGoodsId: string;
    articleNo: string;
    colorId: { colorId: string; name: string; type: string };
    unitId: { unitId: string; name: string };
    gsmId: { gsmId: string; name: string };
}

export interface PopulatedPriceList {
    _id: string;
    priceListId: string;
    purchaseRate: number;
    supplierId: { supplierId: string; supplierName: string };
}

export interface InvoiceItem {
    _id: string;
    invoiceId: string;
    finishGoodsId: string;
    supplierPurchasePriceId: string;
    finishGoods: PopulatedFinishGoods;
    priceList: PopulatedPriceList;
    invoiceQty: number;
    unitPrice: number;
    commission: number;
    price: number;
    amount: number;
}

export interface Invoice {
    _id: string;
    invoiceId: string;
    invoiceNo: string;
    clientId: string;
    currencyId: string;
    paymentId: string;
    bankId: string;
    client: PopulatedClient;
    currency: PopulatedCurrency;
    payment: PopulatedPayment;
    bank: PopulatedBank;
    items: InvoiceItem[];
    totalQty: number;
    totalAmount: number;
    totalCommissionAmount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface InvoiceItemDto {
    finishGoodsId: string;
    supplierPurchasePriceId: string;
    invoiceQty: number;
    unitPrice: number;
    commission: number;
    price: number;
    amount: number;
}

export interface CreateInvoiceDto {
    invoiceNo: string;
    clientId: string;
    currencyId: string;
    paymentId: string;
    bankId: string;
    items: InvoiceItemDto[];
    isActive?: boolean;
}

export interface UpdateInvoiceDto {
    invoiceNo?: string;
    clientId?: string;
    currencyId?: string;
    paymentId?: string;
    bankId?: string;
    items?: InvoiceItemDto[];
    isActive?: boolean;
}

// ─── API ──────────────────────────────────────────────────────────────────────
export const invoiceApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllInvoices: build.query<Invoice[], void>({
            query: () => ({ url: '/admin/invoices/all', method: 'GET' }),
            // providesTags: ['Invoice'],
        }),
        getInvoiceById: build.query<Invoice, string>({
            query: (id) => ({ url: `/admin/invoices/single/${id}`, method: 'GET' }),
            // providesTags: (_r, _e, id) => [{ type: 'Invoice', id }],
        }),
        getInvoicesByClient: build.query<Invoice[], string>({
            query: (clientId) => ({ url: `/admin/invoices/by-client/${clientId}`, method: 'GET' }),
            // providesTags: ['Invoice'],
        }),
        createInvoice: build.mutation<Invoice, CreateInvoiceDto>({
            query: (data) => ({ url: '/admin/invoices/create', method: 'POST', data }),
            // invalidatesTags: ['Invoice'],
        }),
        updateInvoice: build.mutation<Invoice, { id: string; data: UpdateInvoiceDto }>({
            query: ({ id, data }) => ({ url: `/admin/invoices/update/${id}`, method: 'PATCH', data }),
            // invalidatesTags: (_r, _e, { id }) => ['Invoice', { type: 'Invoice', id }],
        }),
        deleteInvoice: build.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/admin/invoices/delete/${id}`, method: 'DELETE' }),
            // invalidatesTags: ['Invoice'],
        }),
        toggleInvoiceStatus: build.mutation<Invoice, string>({
            query: (id) => ({ url: `/invoices/${id}/toggle-status`, method: 'PATCH' }),
            // invalidatesTags: ['Invoice'],
        }),
    }),
});

export const {
    useGetAllInvoicesQuery,
    useGetInvoiceByIdQuery,
    useGetInvoicesByClientQuery,
    useCreateInvoiceMutation,
    useUpdateInvoiceMutation,
    useDeleteInvoiceMutation,
    useToggleInvoiceStatusMutation,
} = invoiceApi;