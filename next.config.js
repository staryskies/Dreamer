/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    });

    // Handle Monaco Editor ESM imports
    config.resolve.alias = {
      ...config.resolve.alias,
      'monaco-editor': 'monaco-editor/esm/vs/editor/editor.api.js',
    };

    return config;
  },
  // Disable strict mode for Monaco Editor
  reactStrictMode: false,
  // Enable ESM support
  experimental: {
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;
