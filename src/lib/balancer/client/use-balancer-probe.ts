'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AnimeProbeRequest,
  AnimeProbeResponse,
  BalancerId,
  BalancerTranslation,
} from '@/types/balancer';
import { ClientBalancerProber } from './balancer-client-prober';

export interface UseBalancerProbeResult {
  loading: boolean;
  probeData: AnimeProbeResponse | null;
  availableBalancers: BalancerId[];
  activeBalancer: BalancerId | null;
  activeTranslation: BalancerTranslation | null;
  setActiveBalancer: (balancerId: BalancerId) => void;
  setActiveTranslation: (translation: BalancerTranslation) => void;
  refresh: () => Promise<void>;
}

export function useBalancerProbe(params: {
  animeId: number;
  shikimoriId?: number | null;
  malId?: number | null;
  kinopoiskId?: number | null;
  episodeNumber: number;
  titles: {
    russian?: string | null;
    english?: string | null;
    romaji?: string | null;
    synonyms?: string[];
  };
}): UseBalancerProbeResult {
  const [loading, setLoading] = useState<boolean>(true);
  const [probeData, setProbeData] = useState<AnimeProbeResponse | null>(null);
  const [activeBalancer, setActiveBalancer] = useState<BalancerId | null>(null);
  const [activeTranslation, setActiveTranslation] = useState<BalancerTranslation | null>(null);

  const titlesKey = useMemo(() => {
    return `${params.titles.russian || ''}|${params.titles.english || ''}|${params.titles.romaji || ''}`;
  }, [params.titles.russian, params.titles.english, params.titles.romaji]);

  const fetchProbe = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      try {
        const req: AnimeProbeRequest = {
          animeId: params.animeId,
          shikimoriId: params.shikimoriId,
          malId: params.malId,
          kinopoiskId: params.kinopoiskId,
          episodeNumber: params.episodeNumber,
          titles: params.titles,
        };

        const data = await ClientBalancerProber.probe(req, forceRefresh);
        setProbeData(data);

        const priority: BalancerId[] = ['anilibria', 'kodik', 'alloha', 'collaps', 'lumex', 'sibnet', 'turbo', 'veoveo', 'vibix'];
        const bestAvailable = priority.find((b) => data.availableBalancers.includes(b)) || data.availableBalancers[0];

        if (bestAvailable) {
          setActiveBalancer(bestAvailable);
          const translations = data.results[bestAvailable]?.translations || [];
          if (translations.length > 0) {
            setActiveTranslation(translations[0]);
          }
        }
      } catch (err) {
        console.warn('[useBalancerProbe] Error probing balancers:', err);
      } finally {
        setLoading(false);
      }
    },
    [
      params.animeId,
      params.episodeNumber,
      params.shikimoriId,
      params.malId,
      params.kinopoiskId,
      titlesKey,
      params.titles,
    ]
  );

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (isMounted) {
        await fetchProbe(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [fetchProbe]);

  const handleSelectBalancer = useCallback(
    (balancerId: BalancerId) => {
      setActiveBalancer(balancerId);
      if (probeData) {
        const translations = probeData.results[balancerId]?.translations || [];
        if (translations.length > 0) {
          setActiveTranslation(translations[0]);
        }
      }
    },
    [probeData]
  );

  return {
    loading,
    probeData,
    availableBalancers: probeData?.availableBalancers || [],
    activeBalancer,
    activeTranslation,
    setActiveBalancer: handleSelectBalancer,
    setActiveTranslation,
    refresh: () => fetchProbe(true),
  };
}
