module.exports = {
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    webpack: (config) => {
        config.resolve = {
            ...config.resolve,
            fallback: {
                fs: false,
                path: false,
                os: false,
            },
        };
        return config;
    },
    async headers() {
        return [
          {
            source: '/api/:path*',
            headers: [
              {
                key: 'X-Frame-Options',
                value: 'ALLOW-FROM https://walletconnect.web3easyaccess.link/', // 允许来自 example.com 的页面嵌入
              }
            ]
          }
        ]
      }
};
