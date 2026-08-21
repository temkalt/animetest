import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Heart, Film, User, Plus } from 'lucide-react';

const CURATED_COLLECTIONS = [
  {
    id: 'cyberpunk-masterpieces',
    title: 'Культовый Киберпанк и Неоновое Будущее',
    description: 'Мрачные мегаполисы, аугментации, искусственный интеллект и философские вопросы человечности.',
    cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    count: 14,
    likes: 342,
    author: 'KuroNami Curators',
  },
  {
    id: 'sakuga-gods',
    title: 'Сакуга-Шедевры: Безупречная Анимация',
    description: 'Тайтлы с невероятным уровнем графики и хореографии боев от MAPPA, Ufotable, Bones и Wit Studio.',
    cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    count: 22,
    likes: 890,
    author: 'SakugaLovers',
  },
  {
    id: 'isekai-essentials',
    title: 'Лучшие Исекаи с нетривиальным сюжетом',
    description: 'Перерождения без штампов: глубокие миры, продуманная магия и развитие персонажей.',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    count: 18,
    likes: 512,
    author: 'PortalOtaku',
  },
  {
    id: 'mind-games',
    title: 'Интеллектуальные дуэли и Психология',
    description: 'Игры разума, многоходовочки, манипуляции и закрученные детективы.',
    cover: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=800&auto=format&fit=crop&q=80',
    count: 16,
    likes: 720,
    author: 'DetectiveK',
  },
];

export default function CollectionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              Кураторский отбор
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white">
            Тематические коллекции
          </h1>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-display font-semibold text-xs shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all">
          <Plus className="w-4 h-4" />
          <span>Создать коллекцию</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CURATED_COLLECTIONS.map((c) => (
          <Link
            key={c.id}
            href={`/catalog`}
            className="group relative rounded-3xl overflow-hidden bg-[#0E1017] border border-white/10 hover:border-violet-500/50 transition-all shadow-xl flex flex-col justify-end aspect-[16/9] p-6"
          >
            {/* Background Cover */}
            <Image
              src={c.cover}
              alt={c.title}
              fill
              className="object-cover opacity-40 group-hover:scale-105 group-hover:opacity-50 transition-all duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-[#07080B]/60 to-transparent" />

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {c.count} тайтлов
                </span>
                <div className="flex items-center gap-1 text-xs text-rose-400 font-mono">
                  <Heart className="w-3.5 h-3.5 fill-rose-400" />
                  <span>{c.likes}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold font-display text-white group-hover:text-violet-300 transition-colors">
                {c.title}
              </h3>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
                {c.description}
              </p>

              <div className="text-[11px] font-mono text-slate-400 pt-1">
                Автор: {c.author}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
