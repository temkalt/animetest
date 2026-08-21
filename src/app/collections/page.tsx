import React from 'react';
import type { Metadata } from 'next';
import { CollectionsContainer } from '@/components/collections/CollectionsContainer';

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

export default function CollectionsPage() {
  return <CollectionsContainer />;
}
