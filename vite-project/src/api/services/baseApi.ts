import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../axiosBaseQuery';
// https://private-project-ur1i.onrender.com/
// 'https://private-project-ur1i.onrender.com
export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: axiosBaseQuery({ baseUrl: 'http://test-api.shuvadebnathbd.com/api' }),
    endpoints: (builder) => ({

    }),
});

export const {

} = baseApi;