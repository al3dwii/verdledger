import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // boolean form is gone in Next 15—wrap it in an object:
    serverActions: { enabled: false }
  },

  // Local proxy: /api/* → Fastify on :4000
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:4000/:path*' }
    ];
  },

  webpack(config) {
    // Same alias for non-TypeScript files
    const dir = dirname(fileURLToPath(import.meta.url));
    config.resolve.alias['@'] = path.resolve(dir, 'src');
    return config;
  }
};

export default nextConfig;

// export default {
//   experimental: {
//     serverActions: false
//   }
// };
