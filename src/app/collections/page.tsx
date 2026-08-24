import React from 'react';
import type { Metadata } from 'next';
import { CollectionsContainer } from '@/components/collections/CollectionsContainer';
import { getCuratedCollections } from '@/data/collections.server';

export const metadata: Metadata = {
  title: 'Тематические Коллекции — KuroNami Editorial Archive',
  description:
    'Кураторские подборки шедевров аниме в 1080p: Сакуга, Киберпанк, Темное Фэнтези, Сэйнэн, Романтика и Космос с экспертным разбором анимации.',
  openGraph: {
    title: 'Тематические Коллекции — KuroNami Editorial Archive',
    description:
      'Кураторские подборки шедевров аниме в 1080p: Сакуга, Киберпанк, Темное Фэнтези, Сэйнэн, Романтика и Космос.',
    type: 'website',
  },
};

export const revalidate = 86400; // 24 hours ISR cache

export default async function CollectionsPage() {
  const collections = getCuratedCollections();
  return <CollectionsContainer initialCollections={collections} />;
}
