const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

export const POPULAR_ANIME_QUERY = `
query GetPopularAnime(
  $page: Int,
  $perPage: Int,
  $season: MediaSeason,
  $seasonYear: Int,
  $search: String,
  $genre: String,
  $status: MediaStatus,
  $format: MediaFormat,
  $sort: [MediaSort]
) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media(
      type: ANIME,
      sort: $sort,
      season: $season,
      seasonYear: $seasonYear,
      search: $search,
      genre: $genre,
      status: $status,
      format: $format,
      isAdult: false
    ) {
      id
      idMal
      title {
        romaji
        english
        native
        userPreferred
      }
      format
      status
      season
      seasonYear
      episodes
      duration
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      description(asHtml: false)
      genres
      averageScore
      popularity
      nextAiringEpisode {
        episode
        airingAt
      }
      studios(isMain: true) {
        nodes {
          name
        }
      }
    }
  }
}
`;

export const ANIME_DETAILS_QUERY = `
query GetAnimeDetails($id: Int, $idMal: Int) {
  Media(id: $id, idMal: $idMal, type: ANIME) {
    id
    idMal
    title {
      romaji
      english
      native
      userPreferred
    }
    synonyms
    format
    status
    description(asHtml: false)
    startDate {
      year
      month
      day
    }
    season
    seasonYear
    episodes
    duration
    coverImage {
      extraLarge
      large
      color
    }
    bannerImage
    genres
    tags {
      id
      name
      rank
    }
    averageScore
    popularity
    trailer {
      id
      site
    }
    nextAiringEpisode {
      episode
      airingAt
    }
    studios(isMain: true) {
      nodes {
        name
      }
    }
    relations {
      edges {
        relationType(version: 2)
        node {
          id
          idMal
          title {
            romaji
            english
          }
          format
          seasonYear
          startDate {
            year
          }
          coverImage {
            large
          }
        }
      }
    }
  }
}
`;

export const AIRING_SCHEDULE_QUERY = `
query GetAiringSchedule($page: Int, $airingAt_greater: Int, $airingAt_lesser: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    airingSchedules(
      airingAt_greater: $airingAt_greater,
      airingAt_lesser: $airingAt_lesser,
      sort: TIME
    ) {
      id
      airingAt
      episode
      timeUntilAiring
      media {
        id
        idMal
        title {
          romaji
          english
          native
          userPreferred
        }
        coverImage {
          large
          medium
          color
        }
        format
        genres
        averageScore
        studios(isMain: true) {
          nodes {
            name
          }
        }
      }
    }
  }
}
`;

export async function fetchAniListGraphQL<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(ANILIST_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'KuroNami/2.0 (AnimeStreamingPlatform)',
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
        next: { revalidate: 1800 },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`AniList GraphQL error: ${res.status} ${res.statusText}`);
      }

      const json = await res.json();
      if (json.errors && json.errors.length > 0) {
        throw new Error(`AniList GraphQL error: ${json.errors[0].message}`);
      }
      return json.data;
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 400 * attempt));
      }
    }
  }

  throw lastError || new Error('AniList GraphQL request failed');
}

