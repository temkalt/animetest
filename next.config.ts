import type { NextConfig } from "next";

const ContentSecurityPolicy = `
  default-src 'self' 'unsafe-inline' https: http: data: blob:;
  script-src 'self' 'unsafe-inline' https: http: blob: data:;
  style-src 'self' 'unsafe-inline' https:;
  img-src 'self' data: blob: https: http:;
  font-src 'self' data: https:;
  connect-src 'self' https: http: wss: ws: blob: data:;
  media-src 'self' blob: data: https: http:;
  frame-src 'self' blob: data: https://*.kodikplayer.com https://kodikplayer.com https://*.kodik.biz https://kodik.biz https://*.kodik.info https://kodik.info https://*.kodik.cc https://kodik.cc https://*.aniqit.com https://aniqit.com https://*.theatre.stravers.live https://theatre.stravers.live https://*.anilibria.top https://anilibria.top https://*.youtube.com https://youtube.com https://*.youtube-nocookie.com https://youtube-nocookie.com https://*.vk.com https://vk.com https://*.vkvideo.ru https://vkvideo.ru https://*.video.sibnet.ru https://*.sibnet.ru https://sibnet.ru https://*.collapse.to https://collapse.to https://*.vidsrc.to https://vidsrc.to https://*.autoembed.cc https://player.autoembed.cc https://*.alloha.tv https://alloha.tv https://*.ddbb.lol https://p2.ddbb.lol;
  child-src 'self' blob: data: https://*.kodikplayer.com https://kodikplayer.com https://*.kodik.biz https://kodik.biz https://*.kodik.info https://kodik.info https://*.kodik.cc https://kodik.cc https://*.aniqit.com https://aniqit.com https://*.theatre.stravers.live https://theatre.stravers.live https://*.anilibria.top https://anilibria.top https://*.youtube.com https://youtube.com https://*.youtube-nocookie.com https://youtube-nocookie.com https://*.vk.com https://vk.com https://*.vkvideo.ru https://vkvideo.ru https://*.video.sibnet.ru https://*.sibnet.ru https://sibnet.ru https://*.collapse.to https://collapse.to https://*.vidsrc.to https://vidsrc.to https://*.autoembed.cc https://player.autoembed.cc https://*.alloha.tv https://alloha.tv https://*.ddbb.lol https://p2.ddbb.lol;
  worker-src 'self' blob: data:;
  object-src 'none';
  base-uri 'self';
`.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: 'https', hostname: 's4.anilist.co' },
      { protocol: 'https', hostname: 'shikimori.one' },
      { protocol: 'https', hostname: 'shikimori.me' },
      { protocol: 'https', hostname: 'shikimori.org' },
      { protocol: 'https', hostname: 'shikimori.io' },
      { protocol: 'https', hostname: 'desu.shikimori.one' },
      { protocol: 'https', hostname: 'desu.shikimori.me' },
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
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
