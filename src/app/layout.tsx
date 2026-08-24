import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { MobileBottomNav } from '@/components/ui/MobileBottomNav';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageTransitionProvider } from '@/components/providers/PageTransitionProvider';
import { NavigationProgress } from '@/components/ui/NavigationProgress';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kuronami.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'KuroNami — Премиальный аниме-портал нового поколения',
    template: '%s | KuroNami',
  },
  description:
    'Смотрите аниме в 1080p FHD без рекламы: огромный каталог, мульти-озвучки, авто-пропуск опенингов, умные закладки и синхронизация прогресса.',
  keywords: [
    'аниме онлайн',
    'смотреть аниме',
    'аниме 1080p',
    'онгоинги',
    'KuroNami',
    'аниме без рекламы',
    'смотреть аниме бесплатно',
    'русская озвучка аниме',
    'аниме в хорошем качестве',
    'аниме новинки',
    'аниме каталог',
  ],
  authors: [{ name: 'KuroNami Team', url: siteUrl }],
  creator: 'KuroNami',
  publisher: 'KuroNami',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: siteUrl,
    siteName: 'KuroNami',
    title: 'KuroNami — Премиальный аниме-портал нового поколения',
    description:
      'Смотрите аниме в 1080p FHD без рекламы: огромный каталог, мульти-озвучки, авто-пропуск опенингов, умные закладки и синхронизация прогресса.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KuroNami — Премиальный аниме-портал нового поколения',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KuroNami — Премиальный аниме-портал нового поколения',
    description:
      'Смотрите аниме в 1080p FHD без рекламы: огромный каталог, мульти-озвучки, авто-пропуск опенингов, умные закладки и синхронизация прогресса.',
    images: ['/og-image.png'],
    creator: '@kuronami',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'entertainment',
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark scroll-smooth">
      <head>
        <meta name="referrer" content="no-referrer-when-downgrade" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col antialiased selection:bg-zinc-700 selection:text-white">
        <NavigationProgress />
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 md:pb-8">
          <AuthGuard><PageTransitionProvider>{children}</PageTransitionProvider></AuthGuard>
        </main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
