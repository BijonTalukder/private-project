import { baseApi } from "../baseApi";

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
            // providesTags: ['BankInfo'],
        }),
        getActiveBanks: build.query<BankInfo[], void>({
            query: () => ({ url: '/admin/bank-info/active', method: 'GET' }),
            // providesTags: ['BankInfo'],
        }),
        getBanksByDistrict: build.query<BankInfo[], string>({
            query: (district) => ({ url: `/admin/bank-info/by-district?district=${district}`, method: 'GET' }),
            // providesTags: ['BankInfo'],
        }),
        getBankById: build.query<BankInfo, string>({
            query: (id) => ({ url: `/admin/bank-info/single/${id}`, method: 'GET' }),
            // providesTags: (_r, _e, id) => [{ type: 'BankInfo', id }],
        }),
        createBank: build.mutation<BankInfo, CreateBankInfoDto>({
            query: (data) => ({ url: '/admin/bank-info/create', method: 'POST', data }),
            // invalidatesTags: ['BankInfo'],
        }),
        updateBank: build.mutation<BankInfo, { id: string; data: UpdateBankInfoDto }>({
            query: ({ id, data }) => ({ url: `/admin/bank-info/update/${id}`, method: 'PATCH', data }),
            // invalidatesTags: (_r, _e, { id }) => ['BankInfo', { type: 'BankInfo', id }],
        }),
        deleteBank: build.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/admin/bank-info/delete/${id}`, method: 'DELETE' }),
            // invalidatesTags: ['BankInfo'],
        }),
        toggleBankStatus: build.mutation<BankInfo, string>({
            query: (id) => ({ url: `/admin/bank-info/${id}/toggle-status`, method: 'PATCH' }),
            // invalidatesTags: ['BankInfo'],
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