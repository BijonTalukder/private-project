import { baseApi } from "../baseApi";

export const authApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        login: build.mutation({
            query: (data) => ({
                url: '/admin/auth/login',
                method: "POST",
                data
            })
        })
    })
})
export const { useLoginMutation } = authApi