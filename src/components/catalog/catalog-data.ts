export interface CatalogPreset {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  color: string;
  params: {
    genre?: string;
    status?: string;
    format?: string;
    season?: string;
    year?: string;
    sort?: string;
    search?: string;
  };
}

export const CATALOG_PRESETS: CatalogPreset[] = [
  {
    id: 'trending-2026',
    label: 'В тренде 2026',
    icon: '🔥',
    badge: 'HOT',
    color: 'from-amber-500/20 to-rose-500/20 text-amber-300 border-amber-500/30 hover:border-amber-400/50',
    params: { sort: 'TRENDING_DESC', year: '2026' },
  },
  {
    id: 'ongoing-top',
    label: 'Свежие онгоинги',
    icon: '⚡',
    badge: 'LIVE',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30 hover:border-emerald-400/50',
    params: { status: 'RELEASING', sort: 'POPULARITY_DESC' },
  },
  {
    id: 'masterpieces',
    label: 'Золотая классика',
    icon: '🏆',
    badge: '9.0+',
    color: 'from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/30 hover:border-yellow-400/50',
    params: { sort: 'SCORE_DESC' },
  },
  {
    id: 'movies',
    label: 'Киношедевры',
    icon: '🎬',
    color: 'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30 hover:border-purple-400/50',
    params: { format: 'MOVIE', sort: 'SCORE_DESC' },
  },
  {
    id: 'action-shonen',
    label: 'Экшен & Сёнэн',
    icon: '⚔️',
    color: 'from-rose-500/20 to-red-500/20 text-rose-300 border-rose-500/30 hover:border-rose-400/50',
    params: { genre: 'Action', sort: 'POPULARITY_DESC' },
  },
  {
    id: 'romance',
    label: 'Романтика & Чувства',
    icon: '💖',
    color: 'from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/30 hover:border-pink-400/50',
    params: { genre: 'Romance', sort: 'SCORE_DESC' },
  },
  {
    id: 'scifi-cyber',
    label: 'Киберпанк & Sci-Fi',
    icon: '🚀',
    color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30 hover:border-cyan-400/50',
    params: { genre: 'Sci-Fi', sort: 'POPULARITY_DESC' },
  },
  {
    id: 'fantasy-magic',
    label: 'Магия & Исекай',
    icon: '🧙‍♂️',
    color: 'from-indigo-500/20 to-violet-500/20 text-indigo-300 border-indigo-500/30 hover:border-indigo-400/50',
    params: { genre: 'Fantasy', sort: 'POPULARITY_DESC' },
  },
];

export const GENRE_ITEMS = [
  { value: '', label: 'Все жанры', icon: '✨' },
  { value: 'Action', label: 'Экшен', en: 'Action', icon: '⚔️', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
  { value: 'Adventure', label: 'Приключения', en: 'Adventure', icon: '🗺️', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { value: 'Comedy', label: 'Комедия', en: 'Comedy', icon: '😂', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
  { value: 'Drama', label: 'Драма', en: 'Drama', icon: '🎭', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  { value: 'Fantasy', label: 'Фэнтези', en: 'Fantasy', icon: '🧙‍♂️', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
  { value: 'Horror', label: 'Ужасы', en: 'Horror', icon: '👻', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  { value: 'Mecha', label: 'Меха', en: 'Mecha', icon: '🤖', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  { value: 'Mystery', label: 'Мистика & Детектив', en: 'Mystery', icon: '🔍', color: 'text-teal-400 border-teal-500/30 bg-teal-500/10' },
  { value: 'Psychological', label: 'Психология', en: 'Psychological', icon: '🧠', color: 'text-violet-400 border-violet-500/30 bg-violet-500/10' },
  { value: 'Romance', label: 'Романтика', en: 'Romance', icon: '💖', color: 'text-pink-400 border-pink-500/30 bg-pink-500/10' },
  { value: 'Sci-Fi', label: 'Фантастика', en: 'Sci-Fi', icon: '🚀', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
  { value: 'Slice of Life', label: 'Повседневность', en: 'Slice of Life', icon: '☕', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { value: 'Sports', label: 'Спорт', en: 'Sports', icon: '⚽', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
  { value: 'Supernatural', label: 'Сверхъестественное', en: 'Supernatural', icon: '🔮', color: 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10' },
  { value: 'Thriller', label: 'Триллер', en: 'Thriller', icon: '⚡', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
  { value: 'Ecchi', label: 'Этти', en: 'Ecchi', icon: '💋', color: 'text-rose-300 border-rose-400/30 bg-rose-400/10' },
  { value: 'Mahou Shoujo', label: 'Махо-сёдзё', en: 'Mahou Shoujo', icon: '✨', color: 'text-pink-300 border-pink-400/30 bg-pink-400/10' },
  { value: 'Music', label: 'Музыка', en: 'Music', icon: '🎵', color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
];

export const STATUS_ITEMS = [
  { value: '', label: 'Все статусы', icon: '🌐' },
  { value: 'RELEASING', label: 'Онгоинг (выходит)', shortLabel: 'Онгоинг', dotColor: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { value: 'FINISHED', label: 'Завершён (все серии)', shortLabel: 'Завершён', dotColor: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
  { value: 'NOT_YET_RELEASED', label: 'Анонс (скоро)', shortLabel: 'Анонс', dotColor: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
];

export const FORMAT_ITEMS = [
  { value: '', label: 'Все форматы', icon: '🎬' },
  { value: 'TV', label: 'TV Сериал', shortLabel: 'TV', icon: '📺' },
  { value: 'MOVIE', label: 'Полнометражка', shortLabel: 'Фильм', icon: '🎞️' },
  { value: 'OVA', label: 'OVA / ONA', shortLabel: 'OVA', icon: '💿' },
  { value: 'SPECIAL', label: 'Спешл', shortLabel: 'Спешл', icon: '⭐' },
];

export const SEASON_ITEMS = [
  { value: '', label: 'Все сезоны', icon: '🗓️' },
  { value: 'WINTER', label: 'Зима', icon: '❄️', color: 'text-sky-300' },
  { value: 'SPRING', label: 'Весна', icon: '🌸', color: 'text-pink-300' },
  { value: 'SUMMER', label: 'Лето', icon: '☀️', color: 'text-amber-300' },
  { value: 'FALL', label: 'Осень', icon: '🍂', color: 'text-orange-300' },
];

export const YEAR_ITEMS = [
  { value: '', label: 'Все годы' },
  { value: '2026', label: '2026 год (Новейшие)' },
  { value: '2025', label: '2025 год' },
  { value: '2024', label: '2024 год' },
  { value: '2023', label: '2023 год' },
  { value: '2022', label: '2022 год' },
  { value: '2021', label: '2021 год' },
  { value: '2020', label: '2020 год' },
  { value: '2019', label: '2019 год' },
  { value: '2018', label: '2018 год' },
  { value: '2015', label: '2015–2017' },
  { value: '2010', label: '2010–2014' },
  { value: '2000', label: '2000-е' },
  { value: '1990', label: '90-е & Ретро' },
];

export const SORT_ITEMS = [
  { value: 'POPULARITY_DESC', label: 'По популярности', icon: 'Flame', description: 'Самые просматриваемые тайтлы' },
  { value: 'SCORE_DESC', label: 'По рейтингу', icon: 'Star', description: 'Высокие оценки критиков и зрителей' },
  { value: 'TRENDING_DESC', label: 'В тренде сейчас', icon: 'Zap', description: 'Бурно обсуждаемые новинки' },
  { value: 'START_DATE_DESC', label: 'Новинки релиза', icon: 'Calendar', description: 'Недавние премьеры и серии' },
  { value: 'FAVOURITES_DESC', label: 'В избранном', icon: 'Heart', description: 'Топ пользовательских закладок' },
];
