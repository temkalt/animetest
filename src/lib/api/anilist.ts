const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

export const POPULAR_ANIME_QUERY = `
query GetPopularAnime($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int, $search: String, $genre: String) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      hasNextPage
    }
    media(
      type: ANIME,
      sort: [TRENDING_DESC, POPULARITY_DESC],
      season: $season,
      seasonYear: $seasonYear,
      search: $search,
      genre: $genre,
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
query GetAnimeDetails($id: Int) {
  Media(id: $id, type: ANIME) {
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
query GetAiringSchedule($airingAt_greater: Int, $airingAt_lesser: Int, $perPage: Int) {
  Page(page: 1, perPage: $perPage) {
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
  const res = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    throw new Error(`AniList GraphQL error: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

