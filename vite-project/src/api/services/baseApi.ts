import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../axiosBaseQuery';

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: axiosBaseQuery({ baseUrl: 'http://localhost:3000' }),
    endpoints: (builder) => ({

    }),
});

export const {

} = baseApi;