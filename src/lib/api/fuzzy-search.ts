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

// Cyrillic to Latin transliteration for anime search queries
const CYRILLIC_TO_LATIN_MAP: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
  'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
  'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
  'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
};

export function transliterateCyrillic(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split('')
    .map((ch) => CYRILLIC_TO_LATIN_MAP[ch] !== undefined ? CYRILLIC_TO_LATIN_MAP[ch] : ch)
    .join('')
    .trim();
}

// Common Anime Synonyms, Abbreviations & Slang
export const SYNONYMS_MAP: Record<string, string[]> = {
  'клинок': ['Demon Slayer', 'Kimetsu no Yaiba'],
  'клинок демонов': ['Demon Slayer', 'Kimetsu no Yaiba'],
  'демон слеер': ['Demon Slayer', 'Kimetsu no Yaiba'],
  'магическая битва': ['Jujutsu Kaisen'],
  'магичка': ['Jujutsu Kaisen'],
  'дзюдзюцу': ['Jujutsu Kaisen'],
  'джуджутсу': ['Jujutsu Kaisen'],
  'соло': ['Solo Leveling', 'Ore dake Level Up na Ken'],
  'соло левелинг': ['Solo Leveling'],
  'поднятие уровня': ['Solo Leveling'],
  'поднятие уровня в одиночку': ['Solo Leveling'],
  'фрирен': ['Frieren', 'Sousou no Frieren'],
  'провожающая': ['Sousou no Frieren', 'Frieren'],
  'проважающая': ['Sousou no Frieren', 'Frieren'],
  'атака титанов': ['Attack on Titan', 'Shingeki no Kyojin'],
  'титаны': ['Attack on Titan', 'Shingeki no Kyojin'],
  'человек бензопила': ['Chainsaw Man'],
  'бензопила': ['Chainsaw Man'],
  'пила': ['Chainsaw Man'],
  'ванпанчмен': ['One Punch Man'],
  'ван панч мен': ['One Punch Man'],
  'сайтама': ['One Punch Man'],
  'моя геройская академия': ['Boku no Hero Academia', 'My Hero Academia'],
  'мга': ['Boku no Hero Academia', 'My Hero Academia'],
  'геройка': ['Boku no Hero Academia'],
  'семья шпиона': ['Spy x Family'],
  'шпион': ['Spy x Family'],
  'дандадан': ['Dandadan'],
  'дан да дан': ['Dandadan'],
  'кайдзю 8': ['Kaiju No. 8'],
  'кайдзю': ['Kaiju No. 8'],
  'реинкарнация безработного': ['Mushoku Tensei'],
  'мушоку тенсей': ['Mushoku Tensei'],
  'безработный': ['Mushoku Tensei'],
  'берсерк': ['Berserk'],
  'гатс': ['Berserk'],
  'блич': ['Bleach'],
  'тетрадь смерти': ['Death Note'],
  'дез нот': ['Death Note'],
  'тетрадка': ['Death Note'],
  'стальной алхимик': ['Fullmetal Alchemist'],
  'алхимик': ['Fullmetal Alchemist'],
  'восхождение в тени': ['The Eminence in Shadow', 'Kage no Jitsuryokusha ni Naritakute'],
  'эминенс': ['The Eminence in Shadow'],
  'звездное дитя': ['Oshi no Ko'],
  'звёздное дитя': ['Oshi no Ko'],
  'оши но ко': ['Oshi no Ko'],
  'монолог фармацевта': ['The Apothecary Diaries', 'Kusuriya no Hitorigoto'],
  'аптекарь': ['Kusuriya no Hitorigoto'],
  'башня бога': ['Tower of God', 'Kami no Tou'],
  'одинокий рокер': ['Bocchi the Rock'],
  'бокки': ['Bocchi the Rock'],
  'хвост феи': ['Fairy Tail'],
  'фейри тейл': ['Fairy Tail'],
  'код гиас': ['Code Geass'],
  'лелуш': ['Code Geass'],
  'врата штейна': ['Steins;Gate'],
  'курису': ['Steins;Gate'],
  'гуль': ['Tokyo Ghoul'],
  'токийский гуль': ['Tokyo Ghoul'],
  'канеки': ['Tokyo Ghoul'],
  'мастера меча': ['Sword Art Online', 'SAO'],
  'сао': ['Sword Art Online'],
  'кирито': ['Sword Art Online'],
  'джоджо': ['JoJo no Kimyou na Bouken', 'JoJo'],
  'джо джо': ['JoJo no Kimyou na Bouken', 'JoJo'],
  'волейбол': ['Haikyuu'],
  'хайкью': ['Haikyuu'],
  'блю лок': ['Blue Lock'],
  'синяя тюрьма': ['Blue Lock'],
  'ветролом': ['Wind Breaker'],
  'наруто': ['Naruto'],
  'боруто': ['Boruto'],
  'ван пис': ['One Piece'],
  'ванпис': ['One Piece'],
  'луффи': ['One Piece'],
  'хантер': ['Hunter x Hunter'],
  'хантер х хантер': ['Hunter x Hunter'],
  'евангелион': ['Neon Genesis Evangelion', 'Evangelion'],
  'евангелеон': ['Neon Genesis Evangelion'],
  'ева': ['Neon Genesis Evangelion'],
  'папаши дружбаны': ['Buddy Daddies'],
  'хоримия': ['Horimiya'],
  'клинок ведьм': ['Witchblade'],
  'дороро': ['Dororo'],
  'паразит': ['Kiseijuu', 'Parasyte'],
  'доктор стоун': ['Dr. Stone'],
  'доктор стоун 2': ['Dr. Stone'],
  'доктор стоун 3': ['Dr. Stone'],
  'стоун': ['Dr. Stone'],
  'человек паук': ['Spider-Man'],
  'твое имя': ['Kimi no Na wa', 'Your Name'],
  'твоё имя': ['Kimi no Na wa', 'Your Name'],
  'дитя погоды': ['Tenki no Ko', 'Weathering With You'],
  'форма голоса': ['Koe no Katachi', 'A Silent Voice'],
  'унесенные призраками': ['Sen to Chihiro no Kamikakushi', 'Spirited Away'],
  'унесённые призраками': ['Sen to Chihiro no Kamikakushi', 'Spirited Away'],
  'ходячий замок': ['Howl no Ugoku Shiro', 'Howls Moving Castle'],
  'могила светлячков': ['Hotaru no Haka', 'Grave of the Fireflies'],
  'принцесса мононоке': ['Mononoke Hime', 'Princess Mononoke'],
};

// Build reverse dictionary index from Russian title words to English title slug / AniList IDs
interface SearchIndexEntry {
  searchTerm: string;
  animeId?: number;
}

const REVERSE_SEARCH_INDEX = new Map<string, SearchIndexEntry[]>();

for (const [key, ruTitle] of Object.entries(KNOWN_RUSSIAN_TITLES)) {
  const normRu = ruTitle.toLowerCase().trim();
  const isNumericId = /^\d+$/.test(key);

  const entry: SearchIndexEntry = {
    searchTerm: isNumericId ? normRu : key.replace(/-/g, ' '),
    animeId: isNumericId ? parseInt(key, 10) : undefined,
  };

  // Index full Russian title
  if (!REVERSE_SEARCH_INDEX.has(normRu)) {
    REVERSE_SEARCH_INDEX.set(normRu, []);
  }
  REVERSE_SEARCH_INDEX.get(normRu)!.push(entry);

  // Index key words (min 3 chars)
  const words = normRu.split(/[\s,.:!?-]+/).filter((w) => w.length >= 3);
  for (const w of words) {
    if (!REVERSE_SEARCH_INDEX.has(w)) {
      REVERSE_SEARCH_INDEX.set(w, []);
    }
    const list = REVERSE_SEARCH_INDEX.get(w)!;
    if (list.length < 5) {
      list.push(entry);
    }
  }
}

/**
 * Fast search terms generator for AniList GraphQL.
 * Resolves Russian queries to native Romaji/English anime keywords instantly in 0ms.
 */
export function getAniListSearchTerms(query: string): { terms: string[]; animeIds: number[] } {
  if (!query || !query.trim()) return { terms: [], animeIds: [] };

  const raw = query.trim().toLowerCase();
  const termsSet = new Set<string>();
  const idsSet = new Set<number>();

  // 1. If English/Romaji, add original query directly
  if (!/[а-яё]/i.test(raw)) {
    termsSet.add(query.trim());
  }

  // 2. Direct Synonyms check
  if (SYNONYMS_MAP[raw]) {
    SYNONYMS_MAP[raw].forEach((s) => termsSet.add(s));
  }

  for (const [synKey, targets] of Object.entries(SYNONYMS_MAP)) {
    if (raw.includes(synKey) || synKey.includes(raw)) {
      targets.forEach((t) => termsSet.add(t));
    }
  }

  // 3. Reverse Dictionary Lookup (0ms in-memory)
  if (REVERSE_SEARCH_INDEX.has(raw)) {
    REVERSE_SEARCH_INDEX.get(raw)!.forEach((entry) => {
      if (entry.searchTerm && !/[а-яё]/i.test(entry.searchTerm)) {
        termsSet.add(entry.searchTerm);
      }
      if (entry.animeId) idsSet.add(entry.animeId);
    });
  }

  // Check sub-words
  const words = raw.split(/[\s,.:!?-]+/).filter((w) => w.length >= 3);
  for (const w of words) {
    if (REVERSE_SEARCH_INDEX.has(w)) {
      REVERSE_SEARCH_INDEX.get(w)!.forEach((entry) => {
        if (entry.searchTerm && !/[а-яё]/i.test(entry.searchTerm)) {
          termsSet.add(entry.searchTerm);
        }
        if (entry.animeId) idsSet.add(entry.animeId);
      });
    }
  }

  // 4. Keyboard Layout Switch
  const switched = switchKeyboardLayout(query.trim());
  if (switched && switched.toLowerCase() !== raw) {
    if (!/[а-яё]/i.test(switched)) {
      termsSet.add(switched);
    }
    const switchedRaw = switched.toLowerCase();
    if (SYNONYMS_MAP[switchedRaw]) {
      SYNONYMS_MAP[switchedRaw].forEach((s) => termsSet.add(s));
    }
  }

  // 5. Transliteration fallback
  const translit = transliterateCyrillic(raw);
  if (translit && translit !== raw && translit.length >= 3) {
    termsSet.add(translit);
  }

  // Also include original query as fallback
  termsSet.add(query.trim());

  return {
    terms: Array.from(termsSet).slice(0, 3),
    animeIds: Array.from(idsSet).slice(0, 10),
  };
}

export function getSearchQueryVariations(query: string): string[] {
  const { terms } = getAniListSearchTerms(query);
  return terms;
}
