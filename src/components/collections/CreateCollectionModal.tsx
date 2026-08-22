'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { authStore } from '@/lib/auth/user-store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCollectionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!title.trim()) {
      setError('Введите название коллекции');
      return;
    }
    try {
      authStore.createCollection({
        title: title.trim(),
        description: description.trim(),
        isPublic,
      });
      setTitle('');
      setDescription('');
      setError('');
      onClose();
    } catch (e: any) {
      setError(e.message || 'Ошибка создания');
    }
  };

  return (
    <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4'>
      <div className='w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-zinc-100'>Новая коллекция</h2>
          <button onClick={onClose} className='p-1 text-zinc-400 hover:text-zinc-100 cursor-pointer'>
            <X className='w-5 h-5' />
          </button>
        </div>

        {error && <p className='text-sm text-red-400'>{error}</p>}

        <div className='space-y-3'>
          <div>
            <label className='block text-xs text-zinc-400 mb-1'>Название</label>
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Мои любимые аниме...'
              className='w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600'
            />
          </div>
          <div>
            <label className='block text-xs text-zinc-400 mb-1'>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='О чём эта коллекция...'
              rows={3}
              className='w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-none'
            />
          </div>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='checkbox'
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className='rounded border-zinc-700'
            />
            <span className='text-sm text-zinc-300'>Публичная коллекция</span>
          </label>
        </div>

        <div className='flex items-center gap-3 pt-2'>
          <button
            onClick={handleCreate}
            className='px-4 py-2 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-200 transition-colors cursor-pointer'
          >
            Создать
          </button>
          <button
            onClick={onClose}
            className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors cursor-pointer'
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};
