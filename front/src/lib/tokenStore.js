export const tokenStore = {
    get access() { return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken'); },
    get refresh() { return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken'); },

    save({ accessToken, refreshToken }, persist = true) {
        const accessKey = 'accessToken';
        const refreshKey = 'refreshToken';
        if (persist) {
            localStorage.setItem(accessKey, accessToken);
            localStorage.setItem(refreshKey, refreshToken);
        } else {
            sessionStorage.setItem(accessKey, accessToken);
            sessionStorage.setItem(refreshKey, refreshToken);
        }
    },

    clear() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
    }
};