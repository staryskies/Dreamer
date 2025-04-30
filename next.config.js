/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    });
    return config;
  },
  // Disable strict mode for Monaco Editor
  reactStrictMode: false,
};

module.exports = nextConfig;
