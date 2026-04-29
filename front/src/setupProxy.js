const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://https://pro-2-ayf7.onrender.com', // 백엔드
            changeOrigin: true,
            secure: false,
        })
    );
};
