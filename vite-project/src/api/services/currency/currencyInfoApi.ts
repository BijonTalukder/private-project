import { baseApi } from "../baseApi";

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
            // providesTags: ['CurrencyInfo'],
        }),
        getActiveCurrencies: build.query<CurrencyInfo[], void>({
            query: () => ({ url: '/admin/currency-info/active', method: 'GET' }),
            // providesTags: ['CurrencyInfo'],
        }),
        getCurrencyById: build.query<CurrencyInfo, string>({
            query: (id) => ({ url: `/admin/currency-info/single/${id}`, method: 'GET' }),
            // providesTags: (_r, _e, id) => [{ type: 'CurrencyInfo', id }],
        }),
        createCurrency: build.mutation<CurrencyInfo, CreateCurrencyInfoDto>({
            query: (data) => ({ url: '/admin/currency-info/create', method: 'POST', data }),
            // invalidatesTags: ['CurrencyInfo'],
        }),
        updateCurrency: build.mutation<CurrencyInfo, { id: string; data: UpdateCurrencyInfoDto }>({
            query: ({ id, data }) => ({ url: `/admin/currency-info/update/${id}`, method: 'PATCH', data }),
            // invalidatesTags: (_r, _e, { id }) => ['CurrencyInfo', { type: 'CurrencyInfo', id }],
        }),
        deleteCurrency: build.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/admin/currency-info/delete/${id}`, method: 'DELETE' }),
            // invalidatesTags: ['CurrencyInfo'],
        }),
        toggleCurrencyStatus: build.mutation<CurrencyInfo, string>({
            query: (id) => ({ url: `/currency-info/${id}/toggle-status`, method: 'PATCH' }),
            // invalidatesTags: ['CurrencyInfo'],
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