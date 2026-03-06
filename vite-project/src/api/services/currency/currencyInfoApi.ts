import { baseApi, TAG_TYPES } from "../baseApi";

export interface CurrencyInfo {
    _id: string;
    currencyId: string;
    name: string;
    type: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface CreateCurrencyInfoDto { name: string; type: string; isActive?: boolean; }
export interface UpdateCurrencyInfoDto { name?: string; type?: string; isActive?: boolean; }

export const currencyInfoApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllCurrencies: build.query<CurrencyInfo[], void>({
            query: () => ({ url: '/admin/currency-info/all', method: 'GET' }),
            providesTags: [TAG_TYPES.CURRENCY],
        }),
        getActiveCurrencies: build.query<CurrencyInfo[], void>({
            query: () => ({ url: '/admin/currency-info/active', method: 'GET' }),
            providesTags: [TAG_TYPES.CURRENCY],
        }),
        getCurrencyById: build.query<CurrencyInfo, string>({
            query: (id) => ({ url: `/admin/currency-info/single/${id}`, method: 'GET' }),
            providesTags: (_r, _e, id) => [{ type: TAG_TYPES.CURRENCY, id }],
        }),
        createCurrency: build.mutation<CurrencyInfo, CreateCurrencyInfoDto>({
            query: (data) => ({ url: '/admin/currency-info/create', method: 'POST', data }),
            invalidatesTags: [TAG_TYPES.CURRENCY],
        }),
        updateCurrency: build.mutation<CurrencyInfo, { id: string; data: UpdateCurrencyInfoDto }>({
            query: ({ id, data }) => ({ url: `/admin/currency-info/update/${id}`, method: 'PATCH', data }),
            invalidatesTags: (_r, _e, { id }) => [TAG_TYPES.CURRENCY, { type: TAG_TYPES.CURRENCY, id }],
        }),
        deleteCurrency: build.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/admin/currency-info/delete/${id}`, method: 'DELETE' }),
            invalidatesTags: [TAG_TYPES.CURRENCY],
        }),
        toggleCurrencyStatus: build.mutation<CurrencyInfo, string>({
            query: (id) => ({ url: `/currency-info/${id}/toggle-status`, method: 'PATCH' }),
            invalidatesTags: [TAG_TYPES.CURRENCY],
        }),
    }),
});

export const {
    useGetAllCurrenciesQuery,
    useGetActiveCurrenciesQuery,
    useGetCurrencyByIdQuery,
    useCreateCurrencyMutation,
    useUpdateCurrencyMutation,
    useDeleteCurrencyMutation,
    useToggleCurrencyStatusMutation,
} = currencyInfoApi;