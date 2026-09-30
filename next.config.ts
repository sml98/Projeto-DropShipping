import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    if (dev && (process.platform === 'android' || process.env.TERMUX_DEV === '1')) {
      // Termux cannot watch the Android filesystem ancestors. Keep source watching enabled.
      config.cache = false;
      config.watchOptions = {
        ...config.watchOptions,
        // Webpack accepts one RegExp or an array of strings, never an array of RegExps.
        ignored: /^(?:\/|\/data|\/data\/data)$|(?:^|\/)(?:node_modules|\.git|\.next)(?:\/|$)/,
      };
    }
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
