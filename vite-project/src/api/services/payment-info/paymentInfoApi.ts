import { baseApi } from "../baseApi";

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
            // providesTags: ['PaymentInfo'],
        }),
        getActivePayments: build.query<PaymentInfo[], void>({
            query: () => ({ url: '/admin/payment-info/active', method: 'GET' }),
            // providesTags: ['PaymentInfo'],
        }),
        getPaymentById: build.query<PaymentInfo, string>({
            query: (id) => ({ url: `/admin/payment-info/single/${id}`, method: 'GET' }),
            // providesTags: (_r, _e, id) => [{ type: 'PaymentInfo', id }],
        }),
        createPayment: build.mutation<PaymentInfo, CreatePaymentInfoDto>({
            query: (data) => ({ url: '/admin/payment-info/create', method: 'POST', data }),
            // invalidatesTags: ['PaymentInfo'],
        }),
        updatePayment: build.mutation<PaymentInfo, { id: string; data: UpdatePaymentInfoDto }>({
            query: ({ id, data }) => ({ url: `/admin/payment-info/update/${id}`, method: 'PATCH', data }),
            // invalidatesTags: (_r, _e, { id }) => ['PaymentInfo', { type: 'PaymentInfo', id }],
        }),
        deletePayment: build.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/admin/payment-info/delete/${id}`, method: 'DELETE' }),
            // invalidatesTags: ['PaymentInfo'],
        }),
        togglePaymentStatus: build.mutation<PaymentInfo, string>({
            query: (id) => ({ url: `/admin/payment-info/${id}/toggle-status`, method: 'PATCH' }),
            // invalidatesTags: ['PaymentInfo'],
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