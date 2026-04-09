export const tokenStore = {
    get access() { return sessionStorage.getItem('accessToken'); },
    get refresh() { return sessionStorage.getItem('refreshToken'); },

    save({ accessToken, refreshToken }, persist = true) {
        const accessKey = 'accessToken';
        const refreshKey = 'refreshToken';
        if (persist) {
            sessionStorage.setItem(accessKey, accessToken);
            sessionStorage.setItem(refreshKey, refreshToken);
        } else {
            sessionStorage.setItem(accessKey, accessToken);
            sessionStorage.setItem(refreshKey, refreshToken);
        }
    },

    clear() {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
    }
};