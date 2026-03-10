import { baseApi } from "../baseApi";


// Types
export interface CurrencyConversion {
    _id: string;
    conversionId: string;
    fromCurrency: {
        _id: string;
        currencyId: string;
        name: string;
        type: string;
    };
    toCurrency: {
        _id: string;
        currencyId: string;
        name: string;
        type: string;
    };
    exchangeRate: number;
    effectiveDate: Date | null;
    isActive: boolean;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCurrencyConversionDto {
    fromCurrencyId: string;
    toCurrencyId: string;
    exchangeRate: number;
    effectiveDate?: Date | null;
    isActive?: boolean;
    notes?: string;
}

export interface UpdateCurrencyConversionDto {
    fromCurrencyId?: string;
    toCurrencyId?: string;
    exchangeRate?: number;
    effectiveDate?: Date | null;
    isActive?: boolean;
    notes?: string;
}

export interface ConvertAmountDto {
    amount: number;
    fromCurrencyId: string;
    toCurrencyId: string;
}

export interface ConvertAmountResponse {
    originalAmount: number;
    convertedAmount: number;
    fromCurrency: string;
    toCurrency: string;
    exchangeRate: number;
    conversionDate: Date;
}

// API
export const currencyConversionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getAllConversions: builder.query<CurrencyConversion[], void>({
            query: () => ({
                url: '/admin/currency-conversion/all',
                method: "GET"
            }),
            providesTags: ['CurrencyConversion'],
        }),

        // Get active conversion rates only
        getActiveConversions: builder.query<CurrencyConversion[], void>({
            query: () => ({
                url: '/admin/currency-conversion/active',
                method: "GET"
            }),
            providesTags: ['CurrencyConversion'],
        }),

        // Get conversion rate between two currencies
        getConversionRate: builder.query<CurrencyConversion | null, { from: string; to: string }>({
            query: ({ from, to }) => ({
                url: `/admin/currency-conversion/rate?from=${from}&to=${to}`,
                method: "GET"
            }),
            providesTags: ['CurrencyConversion'],
            // ✅ Transform response to handle errors gracefully
            transformResponse: (response: CurrencyConversion) => {
                return response;
            },
            // ✅ Handle query errors (like 404 when no rate found)
            transformErrorResponse: (response: any) => {
                console.log('Conversion rate error:', response);
                return null;
            },
            // ✅ Keep failed queries in cache as null
            keepUnusedDataFor: 60, // Cache for 60 seconds
        }),

        // Get conversion by ID
        getConversionById: builder.query<CurrencyConversion, string>({
            query: (id) => ({
                url: `/admin/currency-conversion/${id}`,
                method: "GET"

            }),
            providesTags: ['CurrencyConversion'],
        }),

        // Convert amount
        convertAmount: builder.mutation<ConvertAmountResponse, ConvertAmountDto>({
            query: (dto) => ({
                url: '/admin/currency-conversion/convert',
                method: 'POST',
                data: dto,
            }),
        }),

        // Bulk convert amounts
        bulkConvert: builder.mutation<number[], {
            amounts: number[];
            fromCurrencyId: string;
            toCurrencyId: string;
        }>({
            query: (body) => ({
                url: '/admin/currency-conversion/bulk-convert',
                method: 'POST',
                data: body,
            }),
        }),

        // Create conversion rate
        createConversion: builder.mutation<CurrencyConversion, CreateCurrencyConversionDto>({
            query: (dto) => ({

                url: '/admin/currency-conversion',
                method: 'POST',
                data: dto,
            }),
            invalidatesTags: ['CurrencyConversion'],
        }),

        // Update conversion rate
        updateConversion: builder.mutation<CurrencyConversion, { id: string; data: UpdateCurrencyConversionDto }>({
            query: ({ id, data }) => ({
                url: `/admin/currency-conversion/update/${id}`,
                method: 'PUT',
                data: data,
            }),
            invalidatesTags: ['CurrencyConversion'],
        }),

        // Delete conversion rate
        deleteConversion: builder.mutation<CurrencyConversion, string>({
            query: (id) => ({
                url: `/admin/currency-conversion/delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['CurrencyConversion'],
        }),

        // Toggle status
        toggleConversionStatus: builder.mutation<CurrencyConversion, string>({
            query: (id) => ({
                url: `/currency-conversion/${id}/toggle`,
                method: 'PATCH',
            }),
            invalidatesTags: ['CurrencyConversion'],
        }),
    }),
});

export const {
    useGetAllConversionsQuery,
    useGetActiveConversionsQuery,
    useGetConversionRateQuery,
    useGetConversionByIdQuery,
    useConvertAmountMutation,
    useBulkConvertMutation,
    useCreateConversionMutation,
    useUpdateConversionMutation,
    useDeleteConversionMutation,
    useToggleConversionStatusMutation,
} = currencyConversionApi;