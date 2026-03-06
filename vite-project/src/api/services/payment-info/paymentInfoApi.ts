import { baseApi, TAG_TYPES } from "../baseApi";

export interface PaymentInfo {
    _id: string;
    paymentId: string;
    name: string;
    type: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePaymentInfoDto {
    name: string;
    type: string;
    isActive?: boolean;
}

export interface UpdatePaymentInfoDto {
    name?: string;
    type?: string;
    isActive?: boolean;
}

export const paymentInfoApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllPayments: build.query<PaymentInfo[], void>({
            query: () => ({ url: '/admin/payment-info/all', method: 'GET' }),
            providesTags: [TAG_TYPES.PAYMENT],
        }),
        getActivePayments: build.query<PaymentInfo[], void>({
            query: () => ({ url: '/admin/payment-info/active', method: 'GET' }),
            providesTags: [TAG_TYPES.PAYMENT],
        }),
        getPaymentById: build.query<PaymentInfo, string>({
            query: (id) => ({ url: `/admin/payment-info/single/${id}`, method: 'GET' }),
            providesTags: (_r, _e, id) => [{ type: TAG_TYPES.PAYMENT, id }],
        }),
        createPayment: build.mutation<PaymentInfo, CreatePaymentInfoDto>({
            query: (data) => ({ url: '/admin/payment-info/create', method: 'POST', data }),
            invalidatesTags: [TAG_TYPES.PAYMENT],
        }),
        updatePayment: build.mutation<PaymentInfo, { id: string; data: UpdatePaymentInfoDto }>({
            query: ({ id, data }) => ({ url: `/admin/payment-info/update/${id}`, method: 'PATCH', data }),
            invalidatesTags: (_r, _e, { id }) => [TAG_TYPES.PAYMENT, { type: TAG_TYPES.PAYMENT, id }],
        }),
        deletePayment: build.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/admin/payment-info/delete/${id}`, method: 'DELETE' }),
            invalidatesTags: [TAG_TYPES.PAYMENT],
        }),
        togglePaymentStatus: build.mutation<PaymentInfo, string>({
            query: (id) => ({ url: `/admin/payment-info/${id}/toggle-status`, method: 'PATCH' }),
            invalidatesTags: [TAG_TYPES.PAYMENT],
        }),
    }),
});

export const {
    useGetAllPaymentsQuery,
    useGetActivePaymentsQuery,
    useGetPaymentByIdQuery,
    useCreatePaymentMutation,
    useUpdatePaymentMutation,
    useDeletePaymentMutation,
    useTogglePaymentStatusMutation,
} = paymentInfoApi;