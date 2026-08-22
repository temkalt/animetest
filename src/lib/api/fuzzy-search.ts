import { KNOWN_RUSSIAN_TITLES } from './russian-titles';

// Keyboard Layout Switcher: English QWERTY <-> Russian ЙЦУКЕН
const EN_TO_RU: Record<string, string> = {
  q: 'й', w: 'ц', e: 'у', r: 'к', t: 'е', y: 'н', u: 'г', i: 'ш', o: 'щ', p: 'з', '[': 'х', ']': 'ъ',
  a: 'ф', s: 'ы', d: 'в', f: 'а', g: 'п', h: 'р', j: 'о', k: 'л', l: 'д', ';': 'ж', "'": 'э',
  z: 'я', x: 'ч', c: 'с', v: 'м', b: 'и', n: 'т', m: 'ь', ',': 'б', '.': 'ю',
  Q: 'Й', W: 'Ц', E: 'У', R: 'К', T: 'Е', Y: 'Н', U: 'Г', I: 'Ш', O: 'Щ', P: 'З', '{': 'Х', '}': 'Ъ',
  A: 'Ф', S: 'Ы', D: 'В', F: 'А', G: 'П', H: 'Р', J: 'О', K: 'Л', L: 'Д', ':': 'Ж', '"': 'Э',
  Z: 'Я', X: 'Ч', C: 'С', V: 'М', B: 'И', N: 'Т', M: 'Ь', '<': 'Б', '>': 'Ю',
};

const RU_TO_EN: Record<string, string> = {};
for (const [en, ru] of Object.entries(EN_TO_RU)) {
  RU_TO_EN[ru] = en;
}

export function switchKeyboardLayout(text: string): string {
  if (!text) return '';
  const isRussian = /[а-яё]/i.test(text);
  const map = isRussian ? RU_TO_EN : EN_TO_RU;
  return text
    .split('')
    .map((ch) => map[ch] || ch)
    .join('');
}

// Common Anime Synonyms, Abbreviations & Slang
const SYNONYMS_MAP: Record<string, string[]> = {
  'клинок': ['Клинок, рассекающий демонов', 'Kimetsu no Yaiba', 'Demon Slayer'],
  'клинок демонов': ['Клинок, рассекающий демонов', 'Kimetsu no Yaiba', 'Demon Slayer'],
  'демон слеер': ['Клинок, рассекающий демонов', 'Demon Slayer', 'Kimetsu no Yaiba'],
  'магическая битва': ['Магическая битва', 'Jujutsu Kaisen'],
  'магичка': ['Магическая битва', 'Jujutsu Kaisen'],
  'дзюдзюцу': ['Магическая битва', 'Jujutsu Kaisen'],
  'джуджутсу': ['Магическая битва', 'Jujutsu Kaisen'],
  'соло': ['Поднятие уровня в одиночку', 'Solo Leveling', 'Ore dake Level Up na Ken'],
  'соло левелинг': ['Поднятие уровня в одиночку', 'Solo Leveling'],
  'поднятие уровня': ['Поднятие уровня в одиночку', 'Solo Leveling'],
  'фрирен': ['Провожающая в последний путь Фрирен', 'Sousou no Frieren', 'Frieren'],
  'провожающая': ['Провожающая в последний путь Фрирен', 'Sousou no Frieren'],
  'проважающая': ['Провожающая в последний путь Фрирен', 'Sousou no Frieren'],
  'атака титанов': ['Атака титанов', 'Shingeki no Kyojin', 'Attack on Titan'],
  'титаны': ['Атака титанов', 'Shingeki no Kyojin', 'Attack on Titan'],
  'атака': ['Атака титанов', 'Shingeki no Kyojin'],
  'человек бензопила': ['Человек-бензопила', 'Chainsaw Man'],
  'бензопила': ['Человек-бензопила', 'Chainsaw Man'],
  'пила': ['Человек-бензопила', 'Chainsaw Man'],
  'ванпанчмен': ['Ванпанчмен', 'One Punch Man'],
  'ван панч мен': ['Ванпанчмен', 'One Punch Man'],
  'сайтама': ['Ванпанчмен', 'One Punch Man'],
  'моя геройская академия': ['Моя геройская академия', 'Boku no Hero Academia', 'My Hero Academia'],
  'мга': ['Моя геройская академия', 'Boku no Hero Academia'],
  'геройка': ['Моя геройская академия', 'Boku no Hero Academia'],
  'семья шпиона': ['Семья шпиона', 'Spy x Family'],
  'шпион': ['Семья шпиона', 'Spy x Family'],
  'дандадан': ['Дандадан', 'Dandadan'],
  'дан да дан': ['Дандадан', 'Dandadan'],
  'кайдзю 8': ['Кайдзю номер восемь', 'Kaiju No. 8'],
  'кайдзю': ['Кайдзю номер восемь', 'Kaiju No. 8'],
  'реинкарнация безработного': ['Реинкарнация безработного', 'Mushoku Tensei'],
  'мушоку тенсей': ['Реинкарнация безработного', 'Mushoku Tensei'],
  'безработный': ['Реинкарнация безработного', 'Mushoku Tensei'],
  'берсерк': ['Берсерк', 'Berserk'],
  'гатс': ['Берсерк', 'Berserk'],
  'блич': ['Блич', 'Bleach'],
  'блидч': ['Блич', 'Bleach'],
  'тетрадь смерти': ['Тетрадь смерти', 'Death Note'],
  'дез нот': ['Тетрадь смерти', 'Death Note'],
  'тетрадка': ['Тетрадь смерти', 'Death Note'],
  'стальной алхимик': ['Стальной алхимик: Братство', 'Fullmetal Alchemist'],
  'алхимик': ['Стальной алхимик: Братство', 'Fullmetal Alchemist'],
  'восхождение в тени': ['Восхождение в тени!', 'Kage no Jitsuryokusha ni Naritakute'],
  'эминенс': ['Восхождение в тени!', 'The Eminence in Shadow'],
  'звездное дитя': ['Звёздное дитя', 'Oshi no Ko'],
  'звёздное дитя': ['Звёздное дитя', 'Oshi no Ko'],
  'оши но ко': ['Звёздное дитя', 'Oshi no Ko'],
  'монолог фармацевта': ['Монолог фармацевта', 'Kusuriya no Hitorigoto', 'The Apothecary Diaries'],
  'аптекарь': ['Монолог фармацевта', 'Kusuriya no Hitorigoto'],
  'башня бога': ['Башня Бога', 'Tower of God', 'Kami no Tou'],
  'одинокий рокер': ['Одинокий рокер!', 'Bocchi the Rock'],
  'бокки': ['Одинокий рокер!', 'Bocchi the Rock'],
  'хвост феи': ['Хвост Феи', 'Fairy Tail'],
  'фейри тейл': ['Хвост Феи', 'Fairy Tail'],
  'код гиас': ['Код Гиас: Восставший Лелуш', 'Code Geass'],
  'лелуш': ['Код Гиас: Восставший Лелуш', 'Code Geass'],
  'врата штейна': ['Врата Штейна', 'Steins;Gate'],
  'курису': ['Врата Штейна', 'Steins;Gate'],
  'гуль': ['Токийский гуль', 'Tokyo Ghoul'],
  'токийский гуль': ['Токийский гуль', 'Tokyo Ghoul'],
  'канеки': ['Токийский гуль', 'Tokyo Ghoul'],
  'мастера меча': ['Мастера Меча Онлайн', 'Sword Art Online', 'SAO'],
  'сао': ['Мастера Меча Онлайн', 'Sword Art Online'],
  'кирито': ['Мастера Меча Онлайн', 'Sword Art Online'],
  'джоджо': ['Невероятные приключения ДжоДжо', 'JoJo no Kimyou na Bouken'],
  'джо джо': ['Невероятные приключения ДжоДжо', 'JoJo no Kimyou na Bouken'],
  'волейбол': ['Волейбол!!', 'Haikyuu'],
  'хайкью': ['Волейбол!!', 'Haikyuu'],
  'блю лок': ['Синяя тюрьма: Блю Лок', 'Blue Lock'],
  'синяя тюрьма': ['Синяя тюрьма: Блю Лок', 'Blue Lock'],
  'ветролом': ['Ветролом', 'Wind Breaker'],
};

/**
 * Levenshtein Distance for Typo Tolerance
 */
export function getLevenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix: number[][] = [];
  for (let i = 0; i <= bn; ++i) {
    const row = [i];
    matrix.push(row);
  }
  for (let j = 0; j <= an; ++j) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }

  return matrix[bn][an];
}

/**
 * Generates an ordered list of search query variations:
 * 1. Original trimmed query
 * 2. Synonyms / franchise aliases
 * 3. Keyboard layout switched version (e.g. yfhenj -> наруто)
 * 4. Fuzzy matched dictionary titles for typo tolerance
 */
export function getSearchQueryVariations(query: string): string[] {
  if (!query || !query.trim()) return [];

  const raw = query.trim().toLowerCase();
  const variations: Set<string> = new Set();

  // 1. Original query
  variations.add(query.trim());

  // 2. Direct synonym expansion
  if (SYNONYMS_MAP[raw]) {
    SYNONYMS_MAP[raw].forEach((s) => variations.add(s));
  }

  // Check sub-phrases for synonyms
  for (const [synKey, targets] of Object.entries(SYNONYMS_MAP)) {
    if (raw.includes(synKey) || synKey.includes(raw)) {
      targets.forEach((t) => variations.add(t));
    }
  }

  // 3. Keyboard layout switched version
  const switched = switchKeyboardLayout(query.trim());
  if (switched && switched.toLowerCase() !== raw) {
    variations.add(switched);
    const switchedRaw = switched.toLowerCase();
    if (SYNONYMS_MAP[switchedRaw]) {
      SYNONYMS_MAP[switchedRaw].forEach((s) => variations.add(s));
    }
  }

  // 4. Fuzzy match against KNOWN_RUSSIAN_TITLES (typo tolerance)
  const normRaw = raw.replace(/[\W_]+/g, '');
  if (normRaw.length >= 3) {
    let closestTitle: string | null = null;
    let minDistance = Infinity;

    for (const [key, title] of Object.entries(KNOWN_RUSSIAN_TITLES)) {
      const normKey = key.toLowerCase().replace(/[\W_]+/g, '');
      const normTitle = title.toLowerCase().replace(/[\W_]+/g, '');

      // Check distance against dictionary key and Russian title
      const distKey = Math.abs(normKey.length - normRaw.length) <= 3
        ? getLevenshteinDistance(normRaw, normKey)
        : Infinity;
      const distTitle = Math.abs(normTitle.length - normRaw.length) <= 3
        ? getLevenshteinDistance(normRaw, normTitle)
        : Infinity;

      const dist = Math.min(distKey, distTitle);
      if (dist < minDistance && dist <= 2) {
        minDistance = dist;
        closestTitle = title;
      }
    }

    if (closestTitle) {
      variations.add(closestTitle);
    }
  }

  return Array.from(variations);
}
