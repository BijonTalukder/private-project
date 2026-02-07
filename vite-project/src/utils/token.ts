export const getAccessToken = () =>
    localStorage.getItem('accessToken');

export const getRefreshToken = () =>
    localStorage.getItem('refreshToken');

export const setTokens = (access: string, refresh?: string) => {
    localStorage.setItem('accessToken', access);
    if (refresh) {
        localStorage.setItem('refreshToken', refresh);
    }
};

export const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};
