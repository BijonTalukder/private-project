import { baseApi, TAG_TYPES } from "../baseApi";

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface DeliveryChallanItem {
    _id: string;
    challanId: string;
    invoiceItemId: string;
    deliveryQty: number;
    previousDeliveryQty: number;
    remainingQty: number;
    invoiceQty: number;
    invoiceItem?: any; // Populated invoice item with finish goods
}

export interface DeliveryChallan {
    _id: string;
    challanId: string;
    challanNo: string;
    invoiceId: string;
    invoice: any; // Populated invoice
    client: any; // Populated client
    challanDate: string;
    totalDeliveryQty: number;
    remarks?: string;
    isActive: boolean;
    items: DeliveryChallanItem[];
    createdAt: string;
    updatedAt: string;
}

export interface InvoiceDeliveryItem {
    _id: string;
    finishGoods: any;
    invoiceQty: number;
    previousDeliveryQty: number;
    deliverableQty: number;
    unitPrice: number;
    amount: number;
}

export interface InvoiceDeliverySummary {
    invoice: {
        _id: string;
        invoiceId: string;
        invoiceNo: string;
        client: any;
        totalQty: number;
    };
    items: InvoiceDeliveryItem[];
}

export interface DeliveryChallanItemDto {
    invoiceItemId: string;
    deliveryQty: number;
}

export interface CreateDeliveryChallanDto {
    challanNo: string;
    invoiceId: string;
    challanDate: string;
    items: DeliveryChallanItemDto[];
    remarks?: string;
    isActive?: boolean;
}

export interface UpdateDeliveryChallanDto {
    challanNo?: string;
    challanDate?: string;
    items?: DeliveryChallanItemDto[];
    remarks?: string;
    isActive?: boolean;
}

// ─── API ───────────────────────────────────────────────────────────────────────
export const deliveryChallanApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllChallans: build.query<DeliveryChallan[], void>({
            query: () => ({ url: '/admin/delivery-challans/all', method: 'GET' }),
            providesTags: [TAG_TYPES.DELIVERY_CHALLAN],
        }),

        getChallanById: build.query<DeliveryChallan, string>({
            query: (id) => ({ url: `/admin/delivery-challans/single/${id}`, method: 'GET' }),
            providesTags: (_r, _e, id) => [{ type: TAG_TYPES.DELIVERY_CHALLAN, id }],
        }),

        getChallansByInvoice: build.query<DeliveryChallan[], string>({
            query: (invoiceId) => ({ url: `/admin/delivery-challans/invoice/${invoiceId}`, method: 'GET' }),
            providesTags: [TAG_TYPES.DELIVERY_CHALLAN],
        }),

        getInvoiceDeliverySummary: build.query<InvoiceDeliverySummary, string>({
            query: (invoiceId) => ({
                url: `/admin/delivery-challans/invoice/${invoiceId}/summary`,
                method: 'GET',
            }),
            providesTags: [TAG_TYPES.DELIVERY_CHALLAN],
        }),

        createChallan: build.mutation<DeliveryChallan, CreateDeliveryChallanDto>({
            query: (data) => ({ url: '/admin/delivery-challans/create', method: 'POST', data }),
            invalidatesTags: [TAG_TYPES.DELIVERY_CHALLAN],
        }),

        updateChallan: build.mutation<DeliveryChallan, { id: string; data: UpdateDeliveryChallanDto }>({
            query: ({ id, data }) => ({ url: `/admin/delivery-challans/update/${id}`, method: 'PATCH', data }),
            invalidatesTags: (_r, _e, { id }) => [TAG_TYPES.DELIVERY_CHALLAN, { type: TAG_TYPES.DELIVERY_CHALLAN, id }],
        }),

        deleteChallan: build.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/admin/delivery-challans/delete/${id}`, method: 'DELETE' }),
            invalidatesTags: [TAG_TYPES.DELIVERY_CHALLAN],
        }),

        toggleChallanStatus: build.mutation<DeliveryChallan, string>({
            query: (id) => ({ url: `/admin/delivery-challans/toggle-status/${id}`, method: 'PATCH' }),
            invalidatesTags: [TAG_TYPES.DELIVERY_CHALLAN],
        }),
    }),
});

export const {
    useGetAllChallansQuery,
    useGetChallanByIdQuery,
    useGetChallansByInvoiceQuery,
    useGetInvoiceDeliverySummaryQuery,
    useCreateChallanMutation,
    useUpdateChallanMutation,
    useDeleteChallanMutation,
    useToggleChallanStatusMutation,
} = deliveryChallanApi;