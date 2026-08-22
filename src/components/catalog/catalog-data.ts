export interface CatalogPreset {
  id: string;
  label: string;
  icon: string;
  badge?: string;
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
    label: 'В тренде',
    icon: '🔥',
    badge: 'HOT',
    params: { sort: 'TRENDING_DESC', year: '2026' },
  },
  {
    id: 'ongoing-top',
    label: 'Онгоинги',
    icon: '⚡',
    badge: 'LIVE',
    params: { status: 'RELEASING', sort: 'POPULARITY_DESC' },
  },
  {
    id: 'masterpieces',
    label: 'Топ рейтинг',
    icon: '🏆',
    badge: '9.0+',
    params: { sort: 'SCORE_DESC' },
  },
  {
    id: 'movies',
    label: 'Фильмы',
    icon: '🎬',
    params: { format: 'MOVIE', sort: 'SCORE_DESC' },
  },
  {
    id: 'action-shonen',
    label: 'Экшен',
    icon: '⚔️',
    params: { genre: 'Action', sort: 'POPULARITY_DESC' },
  },
  {
    id: 'fantasy-magic',
    label: 'Фэнтези',
    icon: '🧙‍♂️',
    params: { genre: 'Fantasy', sort: 'POPULARITY_DESC' },
  },
  {
    id: 'romance',
    label: 'Романтика',
    icon: '💖',
    params: { genre: 'Romance', sort: 'SCORE_DESC' },
  },
  {
    id: 'scifi-cyber',
    label: 'Фантастика',
    icon: '🚀',
    params: { genre: 'Sci-Fi', sort: 'POPULARITY_DESC' },
  },
];

export const GENRE_ITEMS = [
  { value: '', label: 'Все жанры', icon: '✨' },
  { value: 'Action', label: 'Экшен', en: 'Action', icon: '⚔️' },
  { value: 'Adventure', label: 'Приключения', en: 'Adventure', icon: '🗺️' },
  { value: 'Comedy', label: 'Комедия', en: 'Comedy', icon: '😂' },
  { value: 'Drama', label: 'Драма', en: 'Drama', icon: '🎭' },
  { value: 'Fantasy', label: 'Фэнтези', en: 'Fantasy', icon: '🧙‍♂️' },
  { value: 'Horror', label: 'Ужасы', en: 'Horror', icon: '👻' },
  { value: 'Mecha', label: 'Меха', en: 'Mecha', icon: '🤖' },
  { value: 'Mystery', label: 'Мистика & Детектив', en: 'Mystery', icon: '🔍' },
  { value: 'Psychological', label: 'Психология', en: 'Psychological', icon: '🧠' },
  { value: 'Romance', label: 'Романтика', en: 'Romance', icon: '💖' },
  { value: 'Sci-Fi', label: 'Фантастика', en: 'Sci-Fi', icon: '🚀' },
  { value: 'Slice of Life', label: 'Повседневность', en: 'Slice of Life', icon: '☕' },
  { value: 'Sports', label: 'Спорт', en: 'Sports', icon: '⚽' },
  { value: 'Supernatural', label: 'Сверхъестественное', en: 'Supernatural', icon: '🔮' },
  { value: 'Thriller', label: 'Триллер', en: 'Thriller', icon: '⚡' },
  { value: 'Ecchi', label: 'Этти', en: 'Ecchi', icon: '💋' },
  { value: 'Mahou Shoujo', label: 'Махо-сёдзё', en: 'Mahou Shoujo', icon: '✨' },
  { value: 'Music', label: 'Музыка', en: 'Music', icon: '🎵' },
];

export const STATUS_ITEMS = [
  { value: '', label: 'Все статусы', icon: '🌐' },
  { value: 'RELEASING', label: 'Онгоинг (выходит)', shortLabel: 'Онгоинг', dotColor: 'bg-emerald-400' },
  { value: 'FINISHED', label: 'Завершён (все серии)', shortLabel: 'Завершён', dotColor: 'bg-cyan-400' },
  { value: 'NOT_YET_RELEASED', label: 'Анонс (скоро)', shortLabel: 'Анонс', dotColor: 'bg-amber-400' },
];

export const FORMAT_ITEMS = [
  { value: '', label: 'Все форматы', shortLabel: 'Все форматы', icon: '🎬' },
  { value: 'TV', label: 'TV Сериал', shortLabel: 'TV Сериал', icon: '📺' },
  { value: 'MOVIE', label: 'Фильм (полный метр)', shortLabel: 'Фильм', icon: '🎞️' },
  { value: 'OVA', label: 'OVA / ONA', shortLabel: 'OVA / ONA', icon: '💿' },
  { value: 'SPECIAL', label: 'Спешл', shortLabel: 'Спешл', icon: '⭐' },
];

export const SEASON_ITEMS = [
  { value: '', label: 'Все сезоны', icon: '🗓️' },
  { value: 'WINTER', label: 'Зима', icon: '❄️' },
  { value: 'SPRING', label: 'Весна', icon: '🌸' },
  { value: 'SUMMER', label: 'Лето', icon: '☀️' },
  { value: 'FALL', label: 'Осень', icon: '🍂' },
];

export const YEAR_ITEMS = [
  { value: '', label: 'Все годы' },
  { value: '2026', label: '2026 год' },
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
  { value: 'POPULARITY_DESC', label: 'По популярности', description: 'Самые просматриваемые' },
  { value: 'SCORE_DESC', label: 'По рейтингу', description: 'Высокие оценки критиков и зрителей' },
  { value: 'TRENDING_DESC', label: 'В тренде сейчас', description: 'Бурно обсуждаемые новинки' },
  { value: 'START_DATE_DESC', label: 'Новинки релиза', description: 'Недавние премьеры и серии' },
  { value: 'FAVOURITES_DESC', label: 'В избранном', description: 'Топ пользовательских закладок' },
];
