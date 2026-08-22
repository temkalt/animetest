import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { AuthGuard } from '@/components/auth/AuthGuard';

export const metadata: Metadata = {
  title: 'KuroNami — Премиальный аниме-портал нового поколения',
  description: 'Смотрите аниме в 1080p без рекламы: огромный каталог, мульти-озвучки, авто-пропуск опенингов и локальная синхронизация.',
  keywords: ['аниме онлайн', 'смотреть аниме', 'аниме 1080p', 'онгоинги', 'KuroNami', 'аниме без рекламы'],
};

export const viewport: Viewport = {
  themeColor: '#06070A',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
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
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AuthGuard>{children}</AuthGuard>
        </main>
        <Footer />
      </body>
    </html>
  );
}
