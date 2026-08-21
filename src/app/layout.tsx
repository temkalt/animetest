import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'KuroNami — Премиальный аниме-портал нового поколения',
  description: 'Смотрите аниме в 1080p без рекламы: огромный каталог, мульти-озвучки, авто-пропуск опенингов и локальная синхронизация.',
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
        <meta name="theme-color" content="#08090D" />
      </head>
      <body className="bg-[#08090D] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-600 selection:text-white bg-noise">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
