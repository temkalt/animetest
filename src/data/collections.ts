export interface CollectionAnimeItem {
  id: number;
  title: string;
  originalTitle?: string;
  year?: number;
  format?: string;
  episodes?: number;
  score: number;
  cover: string;
  banner?: string | null;
  studio?: string;
  synopsis: string;
  genres: string[];
}

export interface CuratorInfo {
  name: string;
  role: string;
  avatar: string;
  badge: string;
  verified: boolean;
}

export interface EditorialCollection {
  id: string;
  issueNumber: string;
  title: string;
  subtitleJp: string;
  editorialNote: string;
  description: string;
  category: 'sakuga' | 'cyberpunk' | 'fantasy' | 'seinen' | 'romance';
  categoryLabel: string;
  accentColor: 'rose' | 'cyan' | 'amber' | 'indigo' | 'emerald';
  banner: string;
  posters: string[];
  count: number;
  curator: CuratorInfo;
  tags: string[];
  studios: string[];
  href: string;
  featured?: boolean;
  spotlightQuote?: string;
  animeList: CollectionAnimeItem[];
}

export const COLLECTIONS_DATA: EditorialCollection[] = [
  {
    "id": "sakuga-gods",
    "issueNumber": "ISSUE № 01",
    "title": "Сакуга-Шедевры: Безупречная Анимация и Визуальный Триумф",
    "subtitleJp": "作画の極致・アニメーションの神々",
    "description": "Лучшие сцены динамичного экшена, невероятная работа со светом и эффектами частиц от MAPPA, Ufotable, Bones и Wit Studio.",
    "editorialNote": "Кураторский сборник от редакции KuroNami: лучшие представители жанра с превосходной анимацией, глубоким сюжетом и высоким рейтингом.",
    "category": "sakuga",
    "categoryLabel": "Сакуга",
    "accentColor": "rose",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg",
    "posters": [
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21507-6YUSbh2m0N1p.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-DdP4vAdssLoz.png"
    ],
    "count": 12,
    "curator": {
      "name": "Редакция KuroNami",
      "role": "Официальная подборка портала",
      "avatar": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80",
      "badge": "KuroNami Official",
      "verified": true
    },
    "tags": [
      "#Action",
      "#Drama",
      "#Supernatural"
    ],
    "studios": [
      "MAPPA",
      "Ufotable",
      "Bones",
      "Madhouse",
      "Wit Studio"
    ],
    "href": "/catalog?genre=Action&sort=SCORE_DESC",
    "animeList": [
      {
        "id": 113415,
        "title": "Магическая битва",
        "originalTitle": "Jujutsu Kaisen",
        "year": 2020,
        "format": "TV",
        "episodes": 24,
        "score": 8.4,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg",
        "synopsis": "A boy fights... for \"the right death.\"<br> <br> Hardship, regret, shame: the negative feelings that humans feel become Curses that lurk in our everyday lives. T...",
        "genres": [
          "Action",
          "Drama",
          "Supernatural"
        ]
      },
      {
        "id": 101922,
        "title": "Клинок, рассекающий демонов",
        "originalTitle": "Kimetsu no Yaiba",
        "year": 2019,
        "format": "TV",
        "episodes": 26,
        "score": 8.3,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg",
        "synopsis": "It is the Taisho Period in Japan. Tanjiro, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon. To make matters worse, hi...",
        "genres": [
          "Action",
          "Adventure",
          "Drama",
          "Fantasy",
          "Supernatural"
        ]
      },
      {
        "id": 21507,
        "title": "Моб Психо 100",
        "originalTitle": "Mob Psycho 100",
        "year": 2016,
        "format": "TV",
        "episodes": 12,
        "score": 8.4,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21507-6YUSbh2m0N1p.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21507-Qx8bGsLXUgLo.jpg",
        "synopsis": "The story revolves around \"Mob,\" a boy who will explode if his emotional capacity reaches 100%. This boy with psychic powers earned his nickname \"Mob\" because h...",
        "genres": [
          "Action",
          "Comedy",
          "Drama",
          "Psychological",
          "Slice of Life",
          "Supernatural"
        ]
      },
      {
        "id": 127230,
        "title": "Человек-бензопила",
        "originalTitle": "Chainsaw Man",
        "year": 2022,
        "format": "TV",
        "episodes": 12,
        "score": 8.3,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-DdP4vAdssLoz.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg",
        "synopsis": "Denji is a teenage boy living with a Chainsaw Devil named Pochita. Due to the debt his father left behind, he has been living a rock-bottom life while repaying ...",
        "genres": [
          "Action",
          "Drama",
          "Horror",
          "Supernatural"
        ]
      },
      {
        "id": 16498,
        "title": "Атака титанов",
        "originalTitle": "Shingeki no Kyojin",
        "year": 2013,
        "format": "TV",
        "episodes": 25,
        "score": 8.5,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmneX.jpg",
        "synopsis": "Several hundred years ago, humans were nearly exterminated by titans. Titans are typically several stories tall, seem to have no intelligence, devour human bein...",
        "genres": [
          "Action",
          "Drama",
          "Fantasy",
          "Mystery"
        ]
      },
      {
        "id": 5114,
        "title": "Стальной алхимик: Братство",
        "originalTitle": "Hagane no Renkinjutsushi: FULLMETAL ALCHEMIST",
        "year": 2009,
        "format": "TV",
        "episodes": 64,
        "score": 9,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx5114-nSWCgQlmOMtj.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/5114-q0V5URebphSG.jpg",
        "synopsis": "\"In order for something to be obtained, something of equal value must be lost.\" <br><br> Alchemy is bound by this Law of Equivalent Exchange—something the young...",
        "genres": [
          "Action",
          "Adventure",
          "Drama",
          "Fantasy"
        ]
      },
      {
        "id": 11061,
        "title": "Охотник х Охотник (2011)",
        "originalTitle": "HUNTER×HUNTER (2011)",
        "year": 2011,
        "format": "TV",
        "episodes": 148,
        "score": 8.9,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-y5gsT1hoHuHw.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/11061-8WkkTZ6duKpq.jpg",
        "synopsis": "A new adaption of the manga of the same name by Togashi Yoshihiro.<br><br> A Hunter is one who travels the world doing all sorts of dangerous tasks. From captur...",
        "genres": [
          "Action",
          "Adventure",
          "Fantasy"
        ]
      },
      {
        "id": 20954,
        "title": "Форма голоса",
        "originalTitle": "Koe no Katachi",
        "year": 2016,
        "format": "MOVIE",
        "episodes": 1,
        "score": 8.8,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20954-sYRfE5jQRtSB.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/20954-f30bHMXa5Qoe.jpg",
        "synopsis": "After transferring into a new school, a deaf girl, Shouko Nishimiya, is bullied by the popular Shouya Ishida. As Shouya continues to bully Shouko, the class tur...",
        "genres": [
          "Drama",
          "Romance",
          "Slice of Life"
        ]
      },
      {
        "id": 21087,
        "title": "Ванпанчмен",
        "originalTitle": "One Punch Man",
        "year": 2015,
        "format": "TV",
        "episodes": 12,
        "score": 8.3,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21087-B5DHjqZ3kW4b.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21087-sHb9zUZFsHe1.jpg",
        "synopsis": "Saitama has a rather peculiar hobby, being a superhero, but despite his heroic deeds and superhuman abilities, a shadow looms over his life. He's become much to...",
        "genres": [
          "Action",
          "Comedy",
          "Sci-Fi",
          "Supernatural"
        ]
      },
      {
        "id": 20605,
        "title": "Токийский гуль",
        "originalTitle": "Tokyo Ghoul",
        "year": 2014,
        "format": "TV",
        "episodes": 12,
        "score": 7.6,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b20605-k665mVkSug8D.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/20605-RCJ7M71zLmrh.jpg",
        "synopsis": "The suspense horror/dark fantasy story is set in Tokyo, which is haunted by mysterious \"ghouls\" who are devouring humans. People are gripped by the fear of thes...",
        "genres": [
          "Action",
          "Drama",
          "Horror",
          "Mystery",
          "Psychological",
          "Supernatural"
        ]
      },
      {
        "id": 142838,
        "title": "Семья шпиона. Часть 2",
        "originalTitle": "SPY×FAMILY Part 2",
        "year": 2022,
        "format": "TV",
        "episodes": 13,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx142838-26JrqcFU1ljB.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/142838-tynuN00wxmKO.jpg",
        "synopsis": "The second half of <i>SPYxFAMILY</i>. <br><br> With Anya Forger successfully enrolled at the renowned Eden Academy, Operation Strix advances to its second phase...",
        "genres": [
          "Action",
          "Comedy",
          "Slice of Life",
          "Supernatural"
        ]
      },
      {
        "id": 151807,
        "title": "Поднятие уровня в одиночку",
        "originalTitle": "Ore dake Level Up na Ken",
        "year": 2024,
        "format": "TV",
        "episodes": 12,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg",
        "synopsis": "They say whatever doesn’t kill you makes you stronger, but that’s not the case for the world’s weakest hunter Seong Jin-U. After being brutally slaughtered by m...",
        "genres": [
          "Action",
          "Adventure",
          "Fantasy"
        ]
      }
    ]
  },
  {
    "id": "cyberpunk-masterpieces",
    "issueNumber": "ISSUE № 02",
    "title": "Культовый Киберпанк и Неоновое Будущее",
    "subtitleJp": "サイバーパンク・ディストピアの残光",
    "description": "Мрачные мегаполисы, искусственный интеллект, экзистенциальные кибер-триллеры и трансгуманизм.",
    "editorialNote": "Кураторский сборник от редакции KuroNami: лучшие представители жанра с превосходной анимацией, глубоким сюжетом и высоким рейтингом.",
    "category": "cyberpunk",
    "categoryLabel": "Киберпанк",
    "accentColor": "cyan",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/120377-c15oLS8CA31s.jpg",
    "posters": [
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx120377-ayZPoxiWt4Li.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx47-4CR68arv452h.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx13601-i42VFuHpqEOJ.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx43-Y6EjeEMM14dj.png"
    ],
    "count": 11,
    "curator": {
      "name": "Редакция KuroNami",
      "role": "Официальная подборка портала",
      "avatar": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80",
      "badge": "KuroNami Official",
      "verified": true
    },
    "tags": [
      "#Action",
      "#Drama",
      "#Psychological",
      "#Sci-Fi"
    ],
    "studios": [
      "MAPPA",
      "Ufotable",
      "Bones",
      "Madhouse",
      "Wit Studio"
    ],
    "href": "/catalog?genre=Action&sort=SCORE_DESC",
    "animeList": [
      {
        "id": 120377,
        "title": "Киберпанк: Бегущие по краю",
        "originalTitle": "Cyberpunk: Edgerunners",
        "year": 2022,
        "format": "ONA",
        "episodes": 10,
        "score": 8.5,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx120377-ayZPoxiWt4Li.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/120377-c15oLS8CA31s.jpg",
        "synopsis": "An original anime series set in in the universe of <i>Cyberpunk 2077</i>.<br> <br> <i>Cyberpunk: Edgerunners</i> tells a standalone, 10-episode story about a st...",
        "genres": [
          "Action",
          "Drama",
          "Psychological",
          "Sci-Fi"
        ]
      },
      {
        "id": 47,
        "title": "Акира",
        "originalTitle": "AKIRA",
        "year": 1988,
        "format": "MOVIE",
        "episodes": 1,
        "score": 7.9,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx47-4CR68arv452h.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/47-fof8HqtNDtvx.jpg",
        "synopsis": "It's the year 2019, thirty-one years have passed since the start of World War III. A top-secret child with amazing powers of the mind breaks free from custody a...",
        "genres": [
          "Action",
          "Adventure",
          "Horror",
          "Psychological",
          "Sci-Fi",
          "Supernatural"
        ]
      },
      {
        "id": 13601,
        "title": "Психопаспорт",
        "originalTitle": "PSYCHO-PASS",
        "year": 2012,
        "format": "TV",
        "episodes": 22,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx13601-i42VFuHpqEOJ.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/13601-YrCmS1oY4uBZ.jpg",
        "synopsis": "Justice, and the enforcement of it, has changed. In the 22nd century, Japan enforces the Sibyl System, an objective means of determining the threat level of eac...",
        "genres": [
          "Action",
          "Psychological",
          "Sci-Fi",
          "Thriller"
        ]
      },
      {
        "id": 43,
        "title": "Призрак в доспехах",
        "originalTitle": "GHOST IN THE SHELL: Koukaku Kidoutai",
        "year": 1995,
        "format": "MOVIE",
        "episodes": 1,
        "score": 8,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx43-Y6EjeEMM14dj.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/43-uDbk1jrG9yod.jpg",
        "synopsis": "2029: A female cybernetic government agent, Major Motoko Kusanagi, and the Internal Bureau of Investigations are hot on the trail of “The Puppet Master,” a myst...",
        "genres": [
          "Action",
          "Psychological",
          "Sci-Fi"
        ]
      },
      {
        "id": 1,
        "title": "Ковбой Бибоп",
        "originalTitle": "Cowboy Bebop",
        "year": 1998,
        "format": "TV",
        "episodes": 26,
        "score": 8.6,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1-GCsPm7waJ4kS.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/1-OquNCNB6srGe.jpg",
        "synopsis": "Enter a world in the distant future, where Bounty Hunters roam the solar system. Spike and Jet, bounty hunting partners, set out on journeys in an ever struggli...",
        "genres": [
          "Action",
          "Adventure",
          "Drama",
          "Sci-Fi"
        ]
      },
      {
        "id": 108632,
        "title": "Re:Zero. Жизнь с нуля в альтернативном мире 2",
        "originalTitle": "Re:Zero kara Hajimeru Isekai Seikatsu 2nd Season",
        "year": 2020,
        "format": "TV",
        "episodes": 13,
        "score": 8.3,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx108632-lQWnmw7XaNOK.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/108632-yeLbrgPN4Oni.jpg",
        "synopsis": "Even after dying countless times, Subaru finally ended the threat of the White Whale and defeated the Witch Cult's Sin Archbishop representing sloth, Petelgeuse...",
        "genres": [
          "Action",
          "Adventure",
          "Drama",
          "Fantasy",
          "Psychological",
          "Thriller"
        ]
      },
      {
        "id": 2009,
        "title": "Явара! Поездка в Атланту",
        "originalTitle": "YAWARA! Special: Zutto Kimi no Koto ga... .",
        "year": 1996,
        "format": "SPECIAL",
        "episodes": 1,
        "score": 6.6,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/2009.jpg",
        "banner": null,
        "synopsis": "Yawara Inokuma competes for Japan in the Atlanta Olympic Games as she meets with several familiar faces throughout the tournament. <br><br> (Source: Anime News ...",
        "genres": [
          "Action",
          "Comedy",
          "Drama",
          "Slice of Life",
          "Sports"
        ]
      },
      {
        "id": 108465,
        "title": "Реинкарнация безработного: История о приключениях в другом мире",
        "originalTitle": "Mushoku Tensei: Isekai Ittara Honki Dasu",
        "year": 2021,
        "format": "TV",
        "episodes": 11,
        "score": 8.2,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx108465-1ANspF1EWyFx.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/108465-RgsRpTMhP9Sv.jpg",
        "synopsis": "When a 34-year-old underachiever gets run over by a bus, his story doesn’t end there. Reincarnated in a new world as an infant, Rudeus will seize every opportun...",
        "genres": [
          "Adventure",
          "Drama",
          "Ecchi",
          "Fantasy"
        ]
      },
      {
        "id": 20507,
        "title": "Прямиком в космос",
        "originalTitle": "Uchuu Icchokusenn",
        "year": 2010,
        "format": "MOVIE",
        "episodes": 1,
        "score": 8.5,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/20507.jpg",
        "banner": null,
        "synopsis": "Can you share the yearning for space? An astronomy boy has grown up into an artist painting the universe, the world of Greek myths including the zodiac, and a v...",
        "genres": [
          "Fantasy",
          "Mystery",
          "Sci-Fi"
        ]
      },
      {
        "id": 112151,
        "title": "Клинок, рассекающий демонов: Бесконечный поезд. Фильм",
        "originalTitle": "Kimetsu no Yaiba: Mugen Ressha-hen",
        "year": 2020,
        "format": "MOVIE",
        "episodes": 1,
        "score": 8.4,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx112151-1qlQwPB1RrJe.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/112151-eHCBz19nf2yC.jpg",
        "synopsis": "This Demon Slayer movie sees Tanjiro Kamado and friends from the Demon Slayer corps board the Infinity Train on a new mission to investigate a mysterious series...",
        "genres": [
          "Action",
          "Adventure",
          "Drama",
          "Fantasy",
          "Mystery",
          "Supernatural"
        ]
      },
      {
        "id": 8074,
        "title": "Школа мертвецов",
        "originalTitle": "Gakuen Mokushiroku: HIGHSCHOOL OF THE DEAD",
        "year": 2010,
        "format": "TV",
        "episodes": 12,
        "score": 6.7,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx8074-YB63Ik96fjPj.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/8074-g8bVkL09nkdw.jpg",
        "synopsis": "The lockers are splattered with blood, the student bodies are piling up and that's not mystery meat they're eating in the cafeteria… it's the faculty! And that'...",
        "genres": [
          "Action",
          "Drama",
          "Ecchi",
          "Horror",
          "Romance",
          "Supernatural"
        ]
      }
    ]
  },
  {
    "id": "dark-fantasy-epics",
    "issueNumber": "ISSUE № 03",
    "title": "Глубокое Темное Фэнтези и Эпос",
    "subtitleJp": "深淵のダークファンタジーと英雄譚",
    "description": "Глубокие миры, продуманная магия, психологическое напряжение, античные чудовища и философские путешествия.",
    "editorialNote": "Кураторский сборник от редакции KuroNami: лучшие представители жанра с превосходной анимацией, глубоким сюжетом и высоким рейтингом.",
    "category": "fantasy",
    "categoryLabel": "Фэнтези",
    "accentColor": "amber",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-ivXNJ23SM1xB.jpg",
    "posters": [
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx33-PSwfE5B0gejI.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx97986-TQ7dCgbS3y5s.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101348-2fhDFPCuMNiz.jpg"
    ],
    "count": 12,
    "curator": {
      "name": "Редакция KuroNami",
      "role": "Официальная подборка портала",
      "avatar": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80",
      "badge": "KuroNami Official",
      "verified": true
    },
    "tags": [
      "#Adventure",
      "#Drama",
      "#Fantasy"
    ],
    "studios": [
      "MAPPA",
      "Ufotable",
      "Bones",
      "Madhouse",
      "Wit Studio"
    ],
    "href": "/catalog?genre=Adventure&sort=SCORE_DESC",
    "animeList": [
      {
        "id": 154587,
        "title": "Frieren: Beyond Journey’s End",
        "originalTitle": "Sousou no Frieren",
        "year": 2023,
        "format": "TV",
        "episodes": 28,
        "score": 9.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-ivXNJ23SM1xB.jpg",
        "synopsis": "The adventure is over but life goes on for an elf mage just beginning to learn what living is all about. Elf mage Frieren and her courageous fellow adventurers ...",
        "genres": [
          "Adventure",
          "Drama",
          "Fantasy"
        ]
      },
      {
        "id": 33,
        "title": "Берсерк",
        "originalTitle": "Kenpuu Denki Berserk",
        "year": 1997,
        "format": "TV",
        "episodes": 25,
        "score": 8.4,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx33-PSwfE5B0gejI.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/33-g7HwYRVm0ZkN.jpg",
        "synopsis": "Set during a time that very much resembles Europe during the Middle Ages, <i>Berserk</i> is a story of revenge set in the castle town of Midland. Recently, the ...",
        "genres": [
          "Action",
          "Adventure",
          "Drama",
          "Fantasy",
          "Horror",
          "Supernatural"
        ]
      },
      {
        "id": 97986,
        "title": "Созданный в Бездне",
        "originalTitle": "Made in Abyss",
        "year": 2017,
        "format": "TV",
        "episodes": 13,
        "score": 8.4,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx97986-TQ7dCgbS3y5s.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/97986-C55UnbJKB7ZF.jpg",
        "synopsis": "The \"Abyss\" is the last unexplored place in the world. Strange and wonderful creatures roam within, and it is full of precious relics that present humans can't ...",
        "genres": [
          "Adventure",
          "Drama",
          "Fantasy",
          "Horror",
          "Mystery",
          "Sci-Fi"
        ]
      },
      {
        "id": 101348,
        "title": "Сага о Винланде",
        "originalTitle": "VINLAND SAGA",
        "year": 2019,
        "format": "TV",
        "episodes": 24,
        "score": 8.7,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101348-2fhDFPCuMNiz.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101348-pivKKffCAwAY.jpg",
        "synopsis": "Thorfinn is son to one of the Vikings' greatest warriors, but when his father is killed in battle by the mercenary leader Askeladd, he swears to have his reveng...",
        "genres": [
          "Action",
          "Adventure",
          "Drama"
        ]
      },
      {
        "id": 21355,
        "title": "Re:Zero. Жизнь с нуля в альтернативном мире",
        "originalTitle": "Re:Zero kara Hajimeru Isekai Seikatsu",
        "year": 2016,
        "format": "TV",
        "episodes": 25,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21355-wRVUrGxpvIQQ.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21355-f9SjOfEJMk5P.jpg",
        "synopsis": "In the story, Subaru Natsuki is an ordinary high school student who is lost in an alternate world, where he is rescued by a beautiful, silver-haired girl. He st...",
        "genres": [
          "Action",
          "Adventure",
          "Drama",
          "Fantasy",
          "Psychological",
          "Romance",
          "Thriller"
        ]
      },
      {
        "id": 108465,
        "title": "Реинкарнация безработного: История о приключениях в другом мире",
        "originalTitle": "Mushoku Tensei: Isekai Ittara Honki Dasu",
        "year": 2021,
        "format": "TV",
        "episodes": 11,
        "score": 8.2,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx108465-1ANspF1EWyFx.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/108465-RgsRpTMhP9Sv.jpg",
        "synopsis": "When a 34-year-old underachiever gets run over by a bus, his story doesn’t end there. Reincarnated in a new world as an infant, Rudeus will seize every opportun...",
        "genres": [
          "Adventure",
          "Drama",
          "Ecchi",
          "Fantasy"
        ]
      },
      {
        "id": 140960,
        "title": "Семья шпиона",
        "originalTitle": "SPY×FAMILY",
        "year": 2022,
        "format": "TV",
        "episodes": 12,
        "score": 8.3,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg",
        "synopsis": "Everyone has a part of themselves they cannot show to anyone else. <br><br> At a time when all nations of the world were involved in a fierce war of information...",
        "genres": [
          "Action",
          "Comedy",
          "Slice of Life",
          "Supernatural"
        ]
      },
      {
        "id": 21459,
        "title": "Моя геройская академия",
        "originalTitle": "Boku no Hero Academia",
        "year": 2016,
        "format": "TV",
        "episodes": 13,
        "score": 7.7,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21459-nYh85uj2Fuwr.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21459-yeVkolGKdGUV.jpg",
        "synopsis": "What would the world be like if 80 percent of the population manifested extraordinary superpowers called “Quirks” at age four? Heroes and villains would be batt...",
        "genres": [
          "Action",
          "Adventure",
          "Comedy"
        ]
      },
      {
        "id": 10087,
        "title": "Судьба/Начало",
        "originalTitle": "Fate/Zero",
        "year": 2011,
        "format": "TV",
        "episodes": 13,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx10087-M4Hd9qrHGrXk.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/10087-32MFY9VnJQ7I.jpg",
        "synopsis": "With the promise of granting any wish, the omnipotent Holy Grail triggered three wars in the past, each too cruel and fierce to leave a victor. In spite of that...",
        "genres": [
          "Action",
          "Drama",
          "Fantasy",
          "Supernatural"
        ]
      },
      {
        "id": 105333,
        "title": "Доктор Стоун",
        "originalTitle": "Dr. STONE",
        "year": 2019,
        "format": "TV",
        "episodes": 24,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx105333-GybuoSoOZfpH.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/105333-KWKGvBM8Hyga.jpg",
        "synopsis": "After five years of harboring unspoken feelings, high-schooler Taiju Ooki is finally ready to confess his love to Yuzuriha Ogawa. Just when Taiju begins his con...",
        "genres": [
          "Action",
          "Adventure",
          "Comedy",
          "Sci-Fi"
        ]
      },
      {
        "id": 21827,
        "title": "Вайолет Эвергарден",
        "originalTitle": "Violet Evergarden",
        "year": 2018,
        "format": "TV",
        "episodes": 13,
        "score": 8.5,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21827-ubzq619ZA2E9.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21827-ROucgYiiiSpR.jpg",
        "synopsis": "A certain point in time, in the continent of Telesis. The great war which divided the continent into North and South has ended after four years, and the people ...",
        "genres": [
          "Drama",
          "Fantasy",
          "Slice of Life"
        ]
      },
      {
        "id": 150672,
        "title": "Ребёнок идола",
        "originalTitle": "[Oshi no Ko]",
        "year": 2023,
        "format": "TV",
        "episodes": 11,
        "score": 8.4,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/150672-ISwoA0eS722H.jpg",
        "synopsis": "When a pregnant young starlet appears in Gorou Amemiya’s countryside medical clinic, the doctor takes it upon himself to safely (and secretly) deliver Ai Hoshin...",
        "genres": [
          "Drama",
          "Mystery",
          "Psychological",
          "Supernatural"
        ]
      }
    ]
  },
  {
    "id": "seinen-psychological",
    "issueNumber": "ISSUE № 04",
    "title": "Сэйнэн: Психология и Бездна Разума",
    "subtitleJp": "青年・心理的深淵と実存の闘い",
    "description": "Многослойные сюжеты, игры разума, манипуляции и закрученные психологические триллеры высшей пробы.",
    "editorialNote": "Кураторский сборник от редакции KuroNami: лучшие представители жанра с превосходной анимацией, глубоким сюжетом и высоким рейтингом.",
    "category": "seinen",
    "categoryLabel": "Сэйнэн",
    "accentColor": "indigo",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/19-kJhwsB0Z97tL.jpg",
    "posters": [
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx19-gtMC64182sm4.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx30-AI1zr74Dh4ye.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-kUgkcrfOrkUM.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx437-69NMlXKFeuse.jpg"
    ],
    "count": 11,
    "curator": {
      "name": "Редакция KuroNami",
      "role": "Официальная подборка портала",
      "avatar": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80",
      "badge": "KuroNami Official",
      "verified": true
    },
    "tags": [
      "#Drama",
      "#Horror",
      "#Mystery",
      "#Psychological",
      "#Thriller"
    ],
    "studios": [
      "MAPPA",
      "Ufotable",
      "Bones",
      "Madhouse",
      "Wit Studio"
    ],
    "href": "/catalog?genre=Drama&sort=SCORE_DESC",
    "animeList": [
      {
        "id": 19,
        "title": "Монстр",
        "originalTitle": "MONSTER",
        "year": 2004,
        "format": "TV",
        "episodes": 74,
        "score": 8.8,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx19-gtMC64182sm4.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/19-kJhwsB0Z97tL.jpg",
        "synopsis": "Dr. Kenzo Tenma is a renowned Japanese brain surgeon working at a leading hospital in Germany. One night, Dr. Tenma risks his reputation and career to save the ...",
        "genres": [
          "Drama",
          "Horror",
          "Mystery",
          "Psychological",
          "Thriller"
        ]
      },
      {
        "id": 30,
        "title": "Евангелион нового поколения",
        "originalTitle": "Shin Seiki Evangelion",
        "year": 1995,
        "format": "TV",
        "episodes": 26,
        "score": 8.3,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx30-AI1zr74Dh4ye.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/30-gEMoHHIqxDgN.jpg",
        "synopsis": "In the year 2015, the Angels, huge, tremendously powerful, alien war machines, appear in Tokyo for the second time. The only hope for Mankind's survival lies in...",
        "genres": [
          "Action",
          "Drama",
          "Mecha",
          "Mystery",
          "Psychological",
          "Sci-Fi"
        ]
      },
      {
        "id": 1535,
        "title": "Тетрадь смерти",
        "originalTitle": "DEATH NOTE",
        "year": 2006,
        "format": "TV",
        "episodes": 37,
        "score": 8.4,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-kUgkcrfOrkUM.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg",
        "synopsis": "Light Yagami is a genius high school student who is about to learn about life through a book of death. When a bored shinigami, a God of Death, named Ryuk drops ...",
        "genres": [
          "Mystery",
          "Psychological",
          "Supernatural",
          "Thriller"
        ]
      },
      {
        "id": 437,
        "title": "Идеальная грусть",
        "originalTitle": "PERFECT BLUE",
        "year": 1998,
        "format": "MOVIE",
        "episodes": 1,
        "score": 8.5,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx437-69NMlXKFeuse.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/437-3yMVTyN7gl2A.jpg",
        "synopsis": "Rising pop star Mima has quit singing to pursue a career as an actress and model, but her fans aren’t ready to see her go... Encouraged by her managers, Mima ta...",
        "genres": [
          "Drama",
          "Horror",
          "Psychological",
          "Thriller"
        ]
      },
      {
        "id": 9253,
        "title": "Врата Штейна",
        "originalTitle": "Steins;Gate",
        "year": 2011,
        "format": "TV",
        "episodes": 24,
        "score": 8.9,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9253-tIUXF2gfU8Sg.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/n9253-JIhmKgBKsWUN.jpg",
        "synopsis": "Self-proclaimed mad scientist Okabe Rintarou lives in a small room in Akihabara, where he invents \"future gadgets\" with fellow lab members Shiina Mayuri, his ai...",
        "genres": [
          "Drama",
          "Psychological",
          "Sci-Fi",
          "Thriller"
        ]
      },
      {
        "id": 20605,
        "title": "Токийский гуль",
        "originalTitle": "Tokyo Ghoul",
        "year": 2014,
        "format": "TV",
        "episodes": 12,
        "score": 7.6,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b20605-k665mVkSug8D.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/20605-RCJ7M71zLmrh.jpg",
        "synopsis": "The suspense horror/dark fantasy story is set in Tokyo, which is haunted by mysterious \"ghouls\" who are devouring humans. People are gripped by the fear of thes...",
        "genres": [
          "Action",
          "Drama",
          "Horror",
          "Mystery",
          "Psychological",
          "Supernatural"
        ]
      },
      {
        "id": 10087,
        "title": "Судьба/Начало",
        "originalTitle": "Fate/Zero",
        "year": 2011,
        "format": "TV",
        "episodes": 13,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx10087-M4Hd9qrHGrXk.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/10087-32MFY9VnJQ7I.jpg",
        "synopsis": "With the promise of granting any wish, the omnipotent Holy Grail triggered three wars in the past, each too cruel and fierce to leave a victor. In spite of that...",
        "genres": [
          "Action",
          "Drama",
          "Fantasy",
          "Supernatural"
        ]
      },
      {
        "id": 113415,
        "title": "Магическая битва",
        "originalTitle": "Jujutsu Kaisen",
        "year": 2020,
        "format": "TV",
        "episodes": 24,
        "score": 8.4,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg",
        "synopsis": "A boy fights... for \"the right death.\"<br> <br> Hardship, regret, shame: the negative feelings that humans feel become Curses that lurk in our everyday lives. T...",
        "genres": [
          "Action",
          "Drama",
          "Supernatural"
        ]
      },
      {
        "id": 142838,
        "title": "Семья шпиона. Часть 2",
        "originalTitle": "SPY×FAMILY Part 2",
        "year": 2022,
        "format": "TV",
        "episodes": 13,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx142838-26JrqcFU1ljB.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/142838-tynuN00wxmKO.jpg",
        "synopsis": "The second half of <i>SPYxFAMILY</i>. <br><br> With Anya Forger successfully enrolled at the renowned Eden Academy, Operation Strix advances to its second phase...",
        "genres": [
          "Action",
          "Comedy",
          "Slice of Life",
          "Supernatural"
        ]
      },
      {
        "id": 21087,
        "title": "Ванпанчмен",
        "originalTitle": "One Punch Man",
        "year": 2015,
        "format": "TV",
        "episodes": 12,
        "score": 8.3,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21087-B5DHjqZ3kW4b.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21087-sHb9zUZFsHe1.jpg",
        "synopsis": "Saitama has a rather peculiar hobby, being a superhero, but despite his heroic deeds and superhuman abilities, a shadow looms over his life. He's become much to...",
        "genres": [
          "Action",
          "Comedy",
          "Sci-Fi",
          "Supernatural"
        ]
      },
      {
        "id": 105333,
        "title": "Доктор Стоун",
        "originalTitle": "Dr. STONE",
        "year": 2019,
        "format": "TV",
        "episodes": 24,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx105333-GybuoSoOZfpH.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/105333-KWKGvBM8Hyga.jpg",
        "synopsis": "After five years of harboring unspoken feelings, high-schooler Taiju Ooki is finally ready to confess his love to Yuzuriha Ogawa. Just when Taiju begins his con...",
        "genres": [
          "Action",
          "Adventure",
          "Comedy",
          "Sci-Fi"
        ]
      }
    ]
  },
  {
    "id": "romance-catharsis",
    "issueNumber": "ISSUE № 05",
    "title": "Романтика & Эмоциональный Катарсис",
    "subtitleJp": "純愛・情熱と涙のカタストロフィ",
    "description": "Красивейшая анимация слез и дождя, симфонический саундтрек, глубокая химия между персонажами и трогательные финалы.",
    "editorialNote": "Кураторский сборник от редакции KuroNami: лучшие представители жанра с превосходной анимацией, глубоким сюжетом и высоким рейтингом.",
    "category": "romance",
    "categoryLabel": "Романтика",
    "accentColor": "rose",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21519-1ayMXgNlmByb.jpg",
    "posters": [
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21519-SUo3ZQuCbYhJ.png",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21827-ubzq619ZA2E9.png",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101921-ufrjLzhSz7L1.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx124080-3i22mRVPBS0T.jpg"
    ],
    "count": 12,
    "curator": {
      "name": "Редакция KuroNami",
      "role": "Официальная подборка портала",
      "avatar": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80",
      "badge": "KuroNami Official",
      "verified": true
    },
    "tags": [
      "#Drama",
      "#Romance",
      "#Supernatural"
    ],
    "studios": [
      "MAPPA",
      "Ufotable",
      "Bones",
      "Madhouse",
      "Wit Studio"
    ],
    "href": "/catalog?genre=Drama&sort=SCORE_DESC",
    "animeList": [
      {
        "id": 21519,
        "title": "Твоё имя",
        "originalTitle": "Kimi no Na wa.",
        "year": 2016,
        "format": "MOVIE",
        "episodes": 1,
        "score": 8.6,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21519-SUo3ZQuCbYhJ.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21519-1ayMXgNlmByb.jpg",
        "synopsis": "Mitsuha Miyamizu, a high school girl, yearns to live the life of a boy in the bustling city of Tokyo—a dream that stands in stark contrast to her present life i...",
        "genres": [
          "Drama",
          "Romance",
          "Supernatural"
        ]
      },
      {
        "id": 21827,
        "title": "Вайолет Эвергарден",
        "originalTitle": "Violet Evergarden",
        "year": 2018,
        "format": "TV",
        "episodes": 13,
        "score": 8.5,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21827-ubzq619ZA2E9.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21827-ROucgYiiiSpR.jpg",
        "synopsis": "A certain point in time, in the continent of Telesis. The great war which divided the continent into North and South has ended after four years, and the people ...",
        "genres": [
          "Drama",
          "Fantasy",
          "Slice of Life"
        ]
      },
      {
        "id": 101921,
        "title": "Госпожа Кагуя: в любви как на войне",
        "originalTitle": "Kaguya-sama wa Kokurasetai: Tensaitachi no Renai Zunousen",
        "year": 2019,
        "format": "TV",
        "episodes": 12,
        "score": 8.3,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101921-ufrjLzhSz7L1.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101921-GgvvFhlNhzlF.jpg",
        "synopsis": "Known for being both brilliant and powerful, Miyuki Shirogane and Kaguya Shinomiya lead the illustrious Shuchiin Academy as near equals. And everyone thinks the...",
        "genres": [
          "Comedy",
          "Psychological",
          "Romance",
          "Slice of Life"
        ]
      },
      {
        "id": 124080,
        "title": "Хоримия",
        "originalTitle": "Horimiya",
        "year": 2021,
        "format": "TV",
        "episodes": 13,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx124080-3i22mRVPBS0T.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/124080-ARyLAHHgikRq.jpg",
        "synopsis": "A secret life is the one thing they have in common. At school, Hori is a prim and perfect social butterfly, but the truth is she's a brash homebody. Meanwhile, ...",
        "genres": [
          "Comedy",
          "Romance",
          "Slice of Life"
        ]
      },
      {
        "id": 20665,
        "title": "Твоя апрельская ложь",
        "originalTitle": "Shigatsu wa Kimi no Uso",
        "year": 2014,
        "format": "TV",
        "episodes": 22,
        "score": 8.4,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20665-TLgkL8T8IRFd.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/20665-j4kSsfhfkM24.jpg",
        "synopsis": "Piano prodigy Arima Kousei dominated the competition and all child musicians knew his name. But after his mother, who was also his instructor, passed away, he h...",
        "genres": [
          "Drama",
          "Music",
          "Romance",
          "Slice of Life"
        ]
      },
      {
        "id": 21154,
        "title": "Рыцари Сидонии. Фильм",
        "originalTitle": "Sidonia no Kishi Movie",
        "year": 2015,
        "format": "MOVIE",
        "episodes": 1,
        "score": 6.8,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21154-yYGNC8yFxM5l.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21154-v7ABJoOvh1Yc.jpg",
        "synopsis": "The film is a compilation of all 12 episodes of the first season with new sequences and redone sound effects....",
        "genres": [
          "Action",
          "Fantasy",
          "Mecha",
          "Sci-Fi",
          "Supernatural"
        ]
      },
      {
        "id": 99423,
        "title": "Милый во Франксе",
        "originalTitle": "Darling in the Franxx",
        "year": 2018,
        "format": "TV",
        "episodes": 24,
        "score": 7,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx99423-8MBxtwCeHf8B.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/99423-OQfem628gdxD.jpg",
        "synopsis": "The distant future: Humanity established the mobile fort city, Plantation, upon the ruined wasteland. Within the city were pilot quarters, Mistilteinn, otherwis...",
        "genres": [
          "Action",
          "Drama",
          "Mecha",
          "Psychological",
          "Romance",
          "Sci-Fi"
        ]
      },
      {
        "id": 105333,
        "title": "Доктор Стоун",
        "originalTitle": "Dr. STONE",
        "year": 2019,
        "format": "TV",
        "episodes": 24,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx105333-GybuoSoOZfpH.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/105333-KWKGvBM8Hyga.jpg",
        "synopsis": "After five years of harboring unspoken feelings, high-schooler Taiju Ooki is finally ready to confess his love to Yuzuriha Ogawa. Just when Taiju begins his con...",
        "genres": [
          "Action",
          "Adventure",
          "Comedy",
          "Sci-Fi"
        ]
      },
      {
        "id": 142838,
        "title": "Семья шпиона. Часть 2",
        "originalTitle": "SPY×FAMILY Part 2",
        "year": 2022,
        "format": "TV",
        "episodes": 13,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx142838-26JrqcFU1ljB.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/142838-tynuN00wxmKO.jpg",
        "synopsis": "The second half of <i>SPYxFAMILY</i>. <br><br> With Anya Forger successfully enrolled at the renowned Eden Academy, Operation Strix advances to its second phase...",
        "genres": [
          "Action",
          "Comedy",
          "Slice of Life",
          "Supernatural"
        ]
      },
      {
        "id": 20954,
        "title": "Форма голоса",
        "originalTitle": "Koe no Katachi",
        "year": 2016,
        "format": "MOVIE",
        "episodes": 1,
        "score": 8.8,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20954-sYRfE5jQRtSB.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/20954-f30bHMXa5Qoe.jpg",
        "synopsis": "After transferring into a new school, a deaf girl, Shouko Nishimiya, is bullied by the popular Shouya Ishida. As Shouya continues to bully Shouko, the class tur...",
        "genres": [
          "Drama",
          "Romance",
          "Slice of Life"
        ]
      },
      {
        "id": 113813,
        "title": "Девушка на час",
        "originalTitle": "Kanojo, Okarishimasu",
        "year": 2020,
        "format": "TV",
        "episodes": 12,
        "score": 6.5,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113813-SnljeXpU3Pw7.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/113813-Al8VofQuNQHV.jpg",
        "synopsis": "Kinoshita Kazuya is a 20-year-old failure of a college student. He managed to kiss his girlfriend once, but was dumped after a month. \"Ugh... Damn it. I never w...",
        "genres": [
          "Comedy",
          "Drama",
          "Romance"
        ]
      },
      {
        "id": 10087,
        "title": "Судьба/Начало",
        "originalTitle": "Fate/Zero",
        "year": 2011,
        "format": "TV",
        "episodes": 13,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx10087-M4Hd9qrHGrXk.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/10087-32MFY9VnJQ7I.jpg",
        "synopsis": "With the promise of granting any wish, the omnipotent Holy Grail triggered three wars in the past, each too cruel and fierce to leave a victor. In spite of that...",
        "genres": [
          "Action",
          "Drama",
          "Fantasy",
          "Supernatural"
        ]
      }
    ]
  },
  {
    "id": "overpower-heroes",
    "issueNumber": "ISSUE № 06",
    "title": "Лучшие аниме с невероятно сильным главным героем (Имба)",
    "subtitleJp": "最強主人公・圧倒的覇道",
    "description": "Главные герои, чья сила ломает любые законы вселенной: эпичные битвы, уважение союзников и абсолютное доминирование.",
    "editorialNote": "Кураторский сборник от редакции KuroNami: лучшие представители жанра с превосходной анимацией, глубоким сюжетом и высоким рейтингом.",
    "category": "sakuga",
    "categoryLabel": "Оверпауэр",
    "accentColor": "amber",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg",
    "posters": [
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21087-B5DHjqZ3kW4b.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21507-6YUSbh2m0N1p.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg"
    ],
    "count": 12,
    "curator": {
      "name": "Редакция KuroNami",
      "role": "Официальная подборка портала",
      "avatar": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80",
      "badge": "KuroNami Official",
      "verified": true
    },
    "tags": [
      "#Action",
      "#Adventure",
      "#Fantasy"
    ],
    "studios": [
      "MAPPA",
      "Ufotable",
      "Bones",
      "Madhouse",
      "Wit Studio"
    ],
    "href": "/catalog?genre=Action&sort=SCORE_DESC",
    "animeList": [
      {
        "id": 151807,
        "title": "Поднятие уровня в одиночку",
        "originalTitle": "Ore dake Level Up na Ken",
        "year": 2024,
        "format": "TV",
        "episodes": 12,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg",
        "synopsis": "They say whatever doesn’t kill you makes you stronger, but that’s not the case for the world’s weakest hunter Seong Jin-U. After being brutally slaughtered by m...",
        "genres": [
          "Action",
          "Adventure",
          "Fantasy"
        ]
      },
      {
        "id": 21087,
        "title": "Ванпанчмен",
        "originalTitle": "One Punch Man",
        "year": 2015,
        "format": "TV",
        "episodes": 12,
        "score": 8.3,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21087-B5DHjqZ3kW4b.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21087-sHb9zUZFsHe1.jpg",
        "synopsis": "Saitama has a rather peculiar hobby, being a superhero, but despite his heroic deeds and superhuman abilities, a shadow looms over his life. He's become much to...",
        "genres": [
          "Action",
          "Comedy",
          "Sci-Fi",
          "Supernatural"
        ]
      },
      {
        "id": 21507,
        "title": "Моб Психо 100",
        "originalTitle": "Mob Psycho 100",
        "year": 2016,
        "format": "TV",
        "episodes": 12,
        "score": 8.4,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21507-6YUSbh2m0N1p.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21507-Qx8bGsLXUgLo.jpg",
        "synopsis": "The story revolves around \"Mob,\" a boy who will explode if his emotional capacity reaches 100%. This boy with psychic powers earned his nickname \"Mob\" because h...",
        "genres": [
          "Action",
          "Comedy",
          "Drama",
          "Psychological",
          "Slice of Life",
          "Supernatural"
        ]
      },
      {
        "id": 101922,
        "title": "Клинок, рассекающий демонов",
        "originalTitle": "Kimetsu no Yaiba",
        "year": 2019,
        "format": "TV",
        "episodes": 26,
        "score": 8.3,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg",
        "synopsis": "It is the Taisho Period in Japan. Tanjiro, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon. To make matters worse, hi...",
        "genres": [
          "Action",
          "Adventure",
          "Drama",
          "Fantasy",
          "Supernatural"
        ]
      },
      {
        "id": 21827,
        "title": "Вайолет Эвергарден",
        "originalTitle": "Violet Evergarden",
        "year": 2018,
        "format": "TV",
        "episodes": 13,
        "score": 8.5,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21827-ubzq619ZA2E9.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21827-ROucgYiiiSpR.jpg",
        "synopsis": "A certain point in time, in the continent of Telesis. The great war which divided the continent into North and South has ended after four years, and the people ...",
        "genres": [
          "Drama",
          "Fantasy",
          "Slice of Life"
        ]
      },
      {
        "id": 140960,
        "title": "Семья шпиона",
        "originalTitle": "SPY×FAMILY",
        "year": 2022,
        "format": "TV",
        "episodes": 12,
        "score": 8.3,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg",
        "synopsis": "Everyone has a part of themselves they cannot show to anyone else. <br><br> At a time when all nations of the world were involved in a fierce war of information...",
        "genres": [
          "Action",
          "Comedy",
          "Slice of Life",
          "Supernatural"
        ]
      },
      {
        "id": 21459,
        "title": "Моя геройская академия",
        "originalTitle": "Boku no Hero Academia",
        "year": 2016,
        "format": "TV",
        "episodes": 13,
        "score": 7.7,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21459-nYh85uj2Fuwr.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21459-yeVkolGKdGUV.jpg",
        "synopsis": "What would the world be like if 80 percent of the population manifested extraordinary superpowers called “Quirks” at age four? Heroes and villains would be batt...",
        "genres": [
          "Action",
          "Adventure",
          "Comedy"
        ]
      },
      {
        "id": 105333,
        "title": "Доктор Стоун",
        "originalTitle": "Dr. STONE",
        "year": 2019,
        "format": "TV",
        "episodes": 24,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx105333-GybuoSoOZfpH.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/105333-KWKGvBM8Hyga.jpg",
        "synopsis": "After five years of harboring unspoken feelings, high-schooler Taiju Ooki is finally ready to confess his love to Yuzuriha Ogawa. Just when Taiju begins his con...",
        "genres": [
          "Action",
          "Adventure",
          "Comedy",
          "Sci-Fi"
        ]
      },
      {
        "id": 127230,
        "title": "Человек-бензопила",
        "originalTitle": "Chainsaw Man",
        "year": 2022,
        "format": "TV",
        "episodes": 12,
        "score": 8.3,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-DdP4vAdssLoz.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg",
        "synopsis": "Denji is a teenage boy living with a Chainsaw Devil named Pochita. Due to the debt his father left behind, he has been living a rock-bottom life while repaying ...",
        "genres": [
          "Action",
          "Drama",
          "Horror",
          "Supernatural"
        ]
      },
      {
        "id": 113415,
        "title": "Магическая битва",
        "originalTitle": "Jujutsu Kaisen",
        "year": 2020,
        "format": "TV",
        "episodes": 24,
        "score": 8.4,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg",
        "synopsis": "A boy fights... for \"the right death.\"<br> <br> Hardship, regret, shame: the negative feelings that humans feel become Curses that lurk in our everyday lives. T...",
        "genres": [
          "Action",
          "Drama",
          "Supernatural"
        ]
      },
      {
        "id": 16498,
        "title": "Атака титанов",
        "originalTitle": "Shingeki no Kyojin",
        "year": 2013,
        "format": "TV",
        "episodes": 25,
        "score": 8.5,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmneX.jpg",
        "synopsis": "Several hundred years ago, humans were nearly exterminated by titans. Titans are typically several stories tall, seem to have no intelligence, devour human bein...",
        "genres": [
          "Action",
          "Drama",
          "Fantasy",
          "Mystery"
        ]
      },
      {
        "id": 5114,
        "title": "Стальной алхимик: Братство",
        "originalTitle": "Hagane no Renkinjutsushi: FULLMETAL ALCHEMIST",
        "year": 2009,
        "format": "TV",
        "episodes": 64,
        "score": 9,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx5114-nSWCgQlmOMtj.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/5114-q0V5URebphSG.jpg",
        "synopsis": "\"In order for something to be obtained, something of equal value must be lost.\" <br><br> Alchemy is bound by this Law of Equivalent Exchange—something the young...",
        "genres": [
          "Action",
          "Adventure",
          "Drama",
          "Fantasy"
        ]
      }
    ]
  },
  {
    "id": "sports-adrenaline",
    "issueNumber": "ISSUE № 07",
    "title": "Адреналиновый Спорт и Командный Дух",
    "subtitleJp": "青春・汗と栄光のコート",
    "description": "Невероятное напряжение соревнований, преодоление себя, командная тактика и жажда победы до последней секунды.",
    "editorialNote": "Кураторский сборник от редакции KuroNami: лучшие представители жанра с превосходной анимацией, глубоким сюжетом и высоким рейтингом.",
    "category": "seinen",
    "categoryLabel": "Спорт",
    "accentColor": "emerald",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/137822-oevspckMGLuY.jpg",
    "posters": [
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx137822-U8naszP96vzC.png",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20464-ooZUyBe4ptp9.png",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11771-uvr44RAwRxPw.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx19647-cIy7ShTL6e9h.jpg"
    ],
    "count": 12,
    "curator": {
      "name": "Редакция KuroNami",
      "role": "Официальная подборка портала",
      "avatar": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80",
      "badge": "KuroNami Official",
      "verified": true
    },
    "tags": [
      "#Action",
      "#Drama",
      "#Sports"
    ],
    "studios": [
      "MAPPA",
      "Ufotable",
      "Bones",
      "Madhouse",
      "Wit Studio"
    ],
    "href": "/catalog?genre=Action&sort=SCORE_DESC",
    "animeList": [
      {
        "id": 137822,
        "title": "Синяя тюрьма: Блю Лок",
        "originalTitle": "Blue Lock",
        "year": 2022,
        "format": "TV",
        "episodes": 24,
        "score": 8,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx137822-U8naszP96vzC.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/137822-oevspckMGLuY.jpg",
        "synopsis": "Japan’s desire for World Cup glory leads the Japanese Football Association to launch a new rigorous training program to find the national team’s next striker. T...",
        "genres": [
          "Action",
          "Drama",
          "Sports"
        ]
      },
      {
        "id": 20464,
        "title": "Волейбол!!",
        "originalTitle": "Haikyuu!!",
        "year": 2014,
        "format": "TV",
        "episodes": 25,
        "score": 8.4,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20464-ooZUyBe4ptp9.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/20464-PpYjO9cPN1gs.jpg",
        "synopsis": "Inspired after watching a volleyball ace nicknamed \"Little Giant\" in action, small-statured Shouyou Hinata revives the volleyball club at his middle school. The...",
        "genres": [
          "Comedy",
          "Drama",
          "Sports"
        ]
      },
      {
        "id": 11771,
        "title": "Баскетбол Куроко",
        "originalTitle": "Kuroko no Basket",
        "year": 2012,
        "format": "TV",
        "episodes": 25,
        "score": 7.8,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11771-uvr44RAwRxPw.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/11771-Bjm9Q0ow0nEh.jpg",
        "synopsis": "Teikou Junior High School's basketball team is crowned champion three years in a row thanks to five outstanding players who, with their breathtaking and unique ...",
        "genres": [
          "Comedy",
          "Sports"
        ]
      },
      {
        "id": 19647,
        "title": "Первый шаг: Восхождение",
        "originalTitle": "Hajime no Ippo: Rising",
        "year": 2013,
        "format": "TV",
        "episodes": 25,
        "score": 8.5,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx19647-cIy7ShTL6e9h.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/19647-yJfiQb4GchCg.jpg",
        "synopsis": "Ippo continues to defend his Japanese Featherweight title from an ever stronger pool of challengers. Meanwhile, Takamura challenges for his second WBC title in ...",
        "genres": [
          "Comedy",
          "Drama",
          "Sports"
        ]
      },
      {
        "id": 98444,
        "title": "Лагерь на свежем воздухе",
        "originalTitle": "Yuru Camp△",
        "year": 2018,
        "format": "TV",
        "episodes": 12,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx98444-Vzysp1EsrzgD.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/98444-FpH9lzLiafe9.jpg",
        "synopsis": "Rin likes to go camping by herself along the lakes that provide a scenic view of Mt. Fuji. Nadeshiko loves to take cycling trips by herself to places where she ...",
        "genres": [
          "Comedy",
          "Slice of Life"
        ]
      },
      {
        "id": 20954,
        "title": "Форма голоса",
        "originalTitle": "Koe no Katachi",
        "year": 2016,
        "format": "MOVIE",
        "episodes": 1,
        "score": 8.8,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20954-sYRfE5jQRtSB.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/20954-f30bHMXa5Qoe.jpg",
        "synopsis": "After transferring into a new school, a deaf girl, Shouko Nishimiya, is bullied by the popular Shouya Ishida. As Shouya continues to bully Shouko, the class tur...",
        "genres": [
          "Drama",
          "Romance",
          "Slice of Life"
        ]
      },
      {
        "id": 10087,
        "title": "Судьба/Начало",
        "originalTitle": "Fate/Zero",
        "year": 2011,
        "format": "TV",
        "episodes": 13,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx10087-M4Hd9qrHGrXk.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/10087-32MFY9VnJQ7I.jpg",
        "synopsis": "With the promise of granting any wish, the omnipotent Holy Grail triggered three wars in the past, each too cruel and fierce to leave a victor. In spite of that...",
        "genres": [
          "Action",
          "Drama",
          "Fantasy",
          "Supernatural"
        ]
      },
      {
        "id": 21087,
        "title": "Ванпанчмен",
        "originalTitle": "One Punch Man",
        "year": 2015,
        "format": "TV",
        "episodes": 12,
        "score": 8.3,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21087-B5DHjqZ3kW4b.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21087-sHb9zUZFsHe1.jpg",
        "synopsis": "Saitama has a rather peculiar hobby, being a superhero, but despite his heroic deeds and superhuman abilities, a shadow looms over his life. He's become much to...",
        "genres": [
          "Action",
          "Comedy",
          "Sci-Fi",
          "Supernatural"
        ]
      },
      {
        "id": 101921,
        "title": "Госпожа Кагуя: в любви как на войне",
        "originalTitle": "Kaguya-sama wa Kokurasetai: Tensaitachi no Renai Zunousen",
        "year": 2019,
        "format": "TV",
        "episodes": 12,
        "score": 8.3,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101921-ufrjLzhSz7L1.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101921-GgvvFhlNhzlF.jpg",
        "synopsis": "Known for being both brilliant and powerful, Miyuki Shirogane and Kaguya Shinomiya lead the illustrious Shuchiin Academy as near equals. And everyone thinks the...",
        "genres": [
          "Comedy",
          "Psychological",
          "Romance",
          "Slice of Life"
        ]
      },
      {
        "id": 124080,
        "title": "Хоримия",
        "originalTitle": "Horimiya",
        "year": 2021,
        "format": "TV",
        "episodes": 13,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx124080-3i22mRVPBS0T.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/124080-ARyLAHHgikRq.jpg",
        "synopsis": "A secret life is the one thing they have in common. At school, Hori is a prim and perfect social butterfly, but the truth is she's a brash homebody. Meanwhile, ...",
        "genres": [
          "Comedy",
          "Romance",
          "Slice of Life"
        ]
      },
      {
        "id": 113415,
        "title": "Магическая битва",
        "originalTitle": "Jujutsu Kaisen",
        "year": 2020,
        "format": "TV",
        "episodes": 24,
        "score": 8.4,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg",
        "synopsis": "A boy fights... for \"the right death.\"<br> <br> Hardship, regret, shame: the negative feelings that humans feel become Curses that lurk in our everyday lives. T...",
        "genres": [
          "Action",
          "Drama",
          "Supernatural"
        ]
      },
      {
        "id": 151807,
        "title": "Поднятие уровня в одиночку",
        "originalTitle": "Ore dake Level Up na Ken",
        "year": 2024,
        "format": "TV",
        "episodes": 12,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg",
        "synopsis": "They say whatever doesn’t kill you makes you stronger, but that’s not the case for the world’s weakest hunter Seong Jin-U. After being brutally slaughtered by m...",
        "genres": [
          "Action",
          "Adventure",
          "Fantasy"
        ]
      }
    ]
  },
  {
    "id": "isekai-adventures",
    "issueNumber": "ISSUE № 08",
    "title": "Великие Исекаи: Попадание в Другой Мир",
    "subtitleJp": "異世界転生・新たなる運命",
    "description": "Перерождение в волшебных измерениях, прокачка способностей, строительство королевств и неизведанные фэнтези-земли.",
    "editorialNote": "Кураторский сборник от редакции KuroNami: лучшие представители жанра с превосходной анимацией, глубоким сюжетом и высоким рейтингом.",
    "category": "fantasy",
    "categoryLabel": "Исекай",
    "accentColor": "cyan",
    "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21355-f9SjOfEJMk5P.jpg",
    "posters": [
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21355-wRVUrGxpvIQQ.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx108465-1ANspF1EWyFx.jpg",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21827-ubzq619ZA2E9.png",
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg"
    ],
    "count": 12,
    "curator": {
      "name": "Редакция KuroNami",
      "role": "Официальная подборка портала",
      "avatar": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80",
      "badge": "KuroNami Official",
      "verified": true
    },
    "tags": [
      "#Action",
      "#Adventure",
      "#Drama",
      "#Fantasy",
      "#Psychological",
      "#Romance",
      "#Thriller"
    ],
    "studios": [
      "MAPPA",
      "Ufotable",
      "Bones",
      "Madhouse",
      "Wit Studio"
    ],
    "href": "/catalog?genre=Action&sort=SCORE_DESC",
    "animeList": [
      {
        "id": 21355,
        "title": "Re:Zero. Жизнь с нуля в альтернативном мире",
        "originalTitle": "Re:Zero kara Hajimeru Isekai Seikatsu",
        "year": 2016,
        "format": "TV",
        "episodes": 25,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21355-wRVUrGxpvIQQ.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21355-f9SjOfEJMk5P.jpg",
        "synopsis": "In the story, Subaru Natsuki is an ordinary high school student who is lost in an alternate world, where he is rescued by a beautiful, silver-haired girl. He st...",
        "genres": [
          "Action",
          "Adventure",
          "Drama",
          "Fantasy",
          "Psychological",
          "Romance",
          "Thriller"
        ]
      },
      {
        "id": 108465,
        "title": "Реинкарнация безработного: История о приключениях в другом мире",
        "originalTitle": "Mushoku Tensei: Isekai Ittara Honki Dasu",
        "year": 2021,
        "format": "TV",
        "episodes": 11,
        "score": 8.2,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx108465-1ANspF1EWyFx.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/108465-RgsRpTMhP9Sv.jpg",
        "synopsis": "When a 34-year-old underachiever gets run over by a bus, his story doesn’t end there. Reincarnated in a new world as an infant, Rudeus will seize every opportun...",
        "genres": [
          "Adventure",
          "Drama",
          "Ecchi",
          "Fantasy"
        ]
      },
      {
        "id": 21827,
        "title": "Вайолет Эвергарден",
        "originalTitle": "Violet Evergarden",
        "year": 2018,
        "format": "TV",
        "episodes": 13,
        "score": 8.5,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21827-ubzq619ZA2E9.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21827-ROucgYiiiSpR.jpg",
        "synopsis": "A certain point in time, in the continent of Telesis. The great war which divided the continent into North and South has ended after four years, and the people ...",
        "genres": [
          "Drama",
          "Fantasy",
          "Slice of Life"
        ]
      },
      {
        "id": 140960,
        "title": "Семья шпиона",
        "originalTitle": "SPY×FAMILY",
        "year": 2022,
        "format": "TV",
        "episodes": 12,
        "score": 8.3,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg",
        "synopsis": "Everyone has a part of themselves they cannot show to anyone else. <br><br> At a time when all nations of the world were involved in a fierce war of information...",
        "genres": [
          "Action",
          "Comedy",
          "Slice of Life",
          "Supernatural"
        ]
      },
      {
        "id": 21459,
        "title": "Моя геройская академия",
        "originalTitle": "Boku no Hero Academia",
        "year": 2016,
        "format": "TV",
        "episodes": 13,
        "score": 7.7,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21459-nYh85uj2Fuwr.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21459-yeVkolGKdGUV.jpg",
        "synopsis": "What would the world be like if 80 percent of the population manifested extraordinary superpowers called “Quirks” at age four? Heroes and villains would be batt...",
        "genres": [
          "Action",
          "Adventure",
          "Comedy"
        ]
      },
      {
        "id": 154587,
        "title": "Frieren: Beyond Journey’s End",
        "originalTitle": "Sousou no Frieren",
        "year": 2023,
        "format": "TV",
        "episodes": 28,
        "score": 9.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-ivXNJ23SM1xB.jpg",
        "synopsis": "The adventure is over but life goes on for an elf mage just beginning to learn what living is all about. Elf mage Frieren and her courageous fellow adventurers ...",
        "genres": [
          "Adventure",
          "Drama",
          "Fantasy"
        ]
      },
      {
        "id": 97986,
        "title": "Созданный в Бездне",
        "originalTitle": "Made in Abyss",
        "year": 2017,
        "format": "TV",
        "episodes": 13,
        "score": 8.4,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx97986-TQ7dCgbS3y5s.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/97986-C55UnbJKB7ZF.jpg",
        "synopsis": "The \"Abyss\" is the last unexplored place in the world. Strange and wonderful creatures roam within, and it is full of precious relics that present humans can't ...",
        "genres": [
          "Adventure",
          "Drama",
          "Fantasy",
          "Horror",
          "Mystery",
          "Sci-Fi"
        ]
      },
      {
        "id": 105333,
        "title": "Доктор Стоун",
        "originalTitle": "Dr. STONE",
        "year": 2019,
        "format": "TV",
        "episodes": 24,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx105333-GybuoSoOZfpH.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/105333-KWKGvBM8Hyga.jpg",
        "synopsis": "After five years of harboring unspoken feelings, high-schooler Taiju Ooki is finally ready to confess his love to Yuzuriha Ogawa. Just when Taiju begins his con...",
        "genres": [
          "Action",
          "Adventure",
          "Comedy",
          "Sci-Fi"
        ]
      },
      {
        "id": 150672,
        "title": "Ребёнок идола",
        "originalTitle": "[Oshi no Ko]",
        "year": 2023,
        "format": "TV",
        "episodes": 11,
        "score": 8.4,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx150672-WqmmwZ4nMzAy.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/150672-ISwoA0eS722H.jpg",
        "synopsis": "When a pregnant young starlet appears in Gorou Amemiya’s countryside medical clinic, the doctor takes it upon himself to safely (and secretly) deliver Ai Hoshin...",
        "genres": [
          "Drama",
          "Mystery",
          "Psychological",
          "Supernatural"
        ]
      },
      {
        "id": 101348,
        "title": "Сага о Винланде",
        "originalTitle": "VINLAND SAGA",
        "year": 2019,
        "format": "TV",
        "episodes": 24,
        "score": 8.7,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101348-2fhDFPCuMNiz.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101348-pivKKffCAwAY.jpg",
        "synopsis": "Thorfinn is son to one of the Vikings' greatest warriors, but when his father is killed in battle by the mercenary leader Askeladd, he swears to have his reveng...",
        "genres": [
          "Action",
          "Adventure",
          "Drama"
        ]
      },
      {
        "id": 151807,
        "title": "Поднятие уровня в одиночку",
        "originalTitle": "Ore dake Level Up na Ken",
        "year": 2024,
        "format": "TV",
        "episodes": 12,
        "score": 8.1,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg",
        "synopsis": "They say whatever doesn’t kill you makes you stronger, but that’s not the case for the world’s weakest hunter Seong Jin-U. After being brutally slaughtered by m...",
        "genres": [
          "Action",
          "Adventure",
          "Fantasy"
        ]
      },
      {
        "id": 101922,
        "title": "Клинок, рассекающий демонов",
        "originalTitle": "Kimetsu no Yaiba",
        "year": 2019,
        "format": "TV",
        "episodes": 26,
        "score": 8.3,
        "cover": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg",
        "banner": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg",
        "synopsis": "It is the Taisho Period in Japan. Tanjiro, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon. To make matters worse, hi...",
        "genres": [
          "Action",
          "Adventure",
          "Drama",
          "Fantasy",
          "Supernatural"
        ]
      }
    ]
  }
];
