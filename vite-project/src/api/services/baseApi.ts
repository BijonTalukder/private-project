import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../axiosBaseQuery';
// https://private-project-ur1i.onrender.com/
export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: axiosBaseQuery({ baseUrl: 'https://private-project-ur1i.onrender.com' }),
    endpoints: (builder) => ({

    }),
});

export const {

} = baseApi;