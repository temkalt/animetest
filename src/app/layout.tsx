import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'KuroNami — Ультимативный аниме-портал нового поколения',
  description: 'Смотрите тысячи аниме в 1080p без рекламы с выбором озвучек, авто-пропуском опенингов и мгновенной синхронизацией.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <body className="bg-[#07080B] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-violet-600 selection:text-white bg-noise">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
