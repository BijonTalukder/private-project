import { baseApi, TAG_TYPES } from "../baseApi";

export interface BankInfo {
    _id: string;
    bankId: string;
    name: string;
    accountName: string;
    branchName: string;
    districtName: string;
    code: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBankInfoDto {
    name: string;
    accountName: string;
    branchName: string;
    districtName: string;
    code: string;
    isActive?: boolean;
}

export interface UpdateBankInfoDto {
    name?: string;
    accountName?: string;
    branchName?: string;
    districtName?: string;
    code?: string;
    isActive?: boolean;
}

export const bankInfoApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllBanks: build.query<BankInfo[], void>({
            query: () => ({ url: '/admin/bank-info/all', method: 'GET' }),
            providesTags: [TAG_TYPES.BANK],
        }),
        getActiveBanks: build.query<BankInfo[], void>({
            query: () => ({ url: '/admin/bank-info/active', method: 'GET' }),
            providesTags: [TAG_TYPES.BANK],
        }),
        getBanksByDistrict: build.query<BankInfo[], string>({
            query: (district) => ({ url: `/admin/bank-info/by-district?district=${district}`, method: 'GET' }),
            providesTags: [TAG_TYPES.BANK],
        }),
        getBankById: build.query<BankInfo, string>({
            query: (id) => ({ url: `/admin/bank-info/single/${id}`, method: 'GET' }),
            providesTags: (_r, _e, id) => [{ type: TAG_TYPES.BANK, id }],
        }),
        createBank: build.mutation<BankInfo, CreateBankInfoDto>({
            query: (data) => ({ url: '/admin/bank-info/create', method: 'POST', data }),
            invalidatesTags: [TAG_TYPES.BANK],
        }),
        updateBank: build.mutation<BankInfo, { id: string; data: UpdateBankInfoDto }>({
            query: ({ id, data }) => ({ url: `/admin/bank-info/update/${id}`, method: 'PATCH', data }),
            invalidatesTags: (_r, _e, { id }) => [TAG_TYPES.BANK, { type: TAG_TYPES.BANK, id }],
        }),
        deleteBank: build.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/admin/bank-info/delete/${id}`, method: 'DELETE' }),
            invalidatesTags: [TAG_TYPES.BANK],
        }),
        toggleBankStatus: build.mutation<BankInfo, string>({
            query: (id) => ({ url: `/admin/bank-info/${id}/toggle-status`, method: 'PATCH' }),
            invalidatesTags: [TAG_TYPES.BANK],
        }),
    }),
});

export const {
    useGetAllBanksQuery,
    useGetActiveBanksQuery,
    useGetBanksByDistrictQuery,
    useGetBankByIdQuery,
    useCreateBankMutation,
    useUpdateBankMutation,
    useDeleteBankMutation,
    useToggleBankStatusMutation,
} = bankInfoApi;