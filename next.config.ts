import type { NextConfig } from "next";

const ContentSecurityPolicy = `
  default-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: data: blob:;
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https: http: blob: data:;
  style-src 'self' 'unsafe-inline' https:;
  img-src 'self' data: blob: https: http:;
  font-src 'self' data: https:;
  connect-src 'self' https: http: wss: ws: blob: data:;
  media-src 'self' blob: data: https: http:;
  frame-src * blob: data: https: http:;
  child-src * blob: data: https: http:;
  worker-src 'self' blob: data:;
  object-src 'none';
  base-uri 'self';
`.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 's4.anilist.co' },
      { protocol: 'https', hostname: 'shikimori.one' },
      { protocol: 'https', hostname: 'shikimori.io' },
      { protocol: 'https', hostname: 'anilibria.top' },
      { protocol: 'https', hostname: 'cache.libria.fun' },
      { protocol: 'https', hostname: 'cdn.myanimelist.net' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy,
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
