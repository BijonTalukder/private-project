import { baseApi, TAG_TYPES } from "../baseApi";

// ─── Nested Types ─────────────────────────────────────────────────────────────

export interface PopulatedClient {
    _id: string;
    clientId: string;
    name: string;
    contactNo: string;
    email: string;
    address: string;
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

// ✅ Fully populated FinishGoods — includes color, unit, gsm objects
export interface PopulatedFinishGoods {
    _id: string;
    finishGoodsId: string;
    articleNo: string;
    colorId: {
        _id: string;
        colorId: string;
        name: string;
        type?: string;
    };
    unitId: {
        _id: string;
        unitId: string;
        name: string;
    };
    gsmId: {
        _id: string;
        gsmId: string;
        name: string;
        value?: number;
    };
    widthId?: { _id: string; widthId: string; name: string; value?: number }; // if width is a ref
    width?: number;   // if width is a plain number on FinishGoods
    description?: string;
}

export interface PopulatedPriceList {
    _id: string;
    priceListId: string;
    purchaseRate: number;
    commission?: number;
    supplierId: {
        _id: string;
        supplierId: string;
        supplierName: string;
    };
    currencyId?: {
        _id: string;
        name: string;
    };
}

export interface InvoiceItem {
    _id: string;
    invoiceId: string;
    finishGoodsId: string;
    supplierPurchasePriceId: string;
    finishGoods: PopulatedFinishGoods;   // ✅ now has .colorId, .unitId, .gsmId as objects
    priceList: PopulatedPriceList;
    invoiceQty: number;
    unitPrice: number;
    commission: number;
    price: number;
    amount: number;
    currencyId: { _id: string; name: string } | string;
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
    currencyId: { _id: string; name: string };
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
            providesTags: [TAG_TYPES.INVOICE],
        }),
        getInvoiceById: build.query<Invoice, string>({
            query: (id) => ({ url: `/admin/invoices/single/${id}`, method: 'GET' }),
            providesTags: (_r, _e, id) => [{ type: TAG_TYPES.INVOICE, id }],
        }),
        getInvoicesByClient: build.query<Invoice[], string>({
            query: (clientId) => ({ url: `/admin/invoices/by-client/${clientId}`, method: 'GET' }),
            providesTags: [TAG_TYPES.INVOICE],
        }),
        createInvoice: build.mutation<Invoice, CreateInvoiceDto>({
            query: (data) => ({ url: '/admin/invoices/create', method: 'POST', data }),
            invalidatesTags: [TAG_TYPES.INVOICE],
        }),
        updateInvoice: build.mutation<Invoice, { id: string; data: UpdateInvoiceDto }>({
            query: ({ id, data }) => ({ url: `/admin/invoices/update/${id}`, method: 'PATCH', data }),
            invalidatesTags: (_r, _e, { id }) => [TAG_TYPES.INVOICE, { type: TAG_TYPES.INVOICE, id }],
        }),
        deleteInvoice: build.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/admin/invoices/delete/${id}`, method: 'DELETE' }),
            invalidatesTags: [TAG_TYPES.INVOICE],
        }),
        toggleInvoiceStatus: build.mutation<Invoice, string>({
            query: (id) => ({ url: `/invoices/${id}/toggle-status`, method: 'PATCH' }),
            invalidatesTags: [TAG_TYPES.INVOICE],
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