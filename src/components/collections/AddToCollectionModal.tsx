'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Plus, Check, FolderPlus, Sparkles, Lock, Globe } from 'lucide-react';
import { authStore, UserCollection } from '@/lib/auth/user-store';

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  animeId: number;
  animeTitle: string;
  animeCover: string;
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({
  isOpen,
  onClose,
  animeId,
  animeTitle,
  animeCover,
}) => {
  const [userCollections, setUserCollections] = useState<UserCollection[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentUser = authStore.getUser();

  useEffect(() => {
    const update = () => {
      const u = authStore.getUser();
      if (u) {
        setUserCollections(authStore.getUserCollections(u.id));
      } else {
        setUserCollections(authStore.getAllCollections());
      }
    };

    update();
    const unsubscribe = authStore.subscribeCollections(() => update());
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  if (!isOpen) return null;

  const handleToggleAnime = (col: UserCollection) => {
    const isAlreadyIn = col.animeIds.includes(animeId);
    if (isAlreadyIn) {
      authStore.removeAnimeFromCollection(col.id, animeId);
      showToast(`Удалено из «${col.title}»`);
    } else {
      authStore.addAnimeToCollection(col.id, animeId);
      showToast(`Добавлено в «${col.title}» ✨`);
    }
  };

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = authStore.createCollection({
        title: newTitle.trim(),
        description: newDesc.trim(),
        isPublic,
        coverImage: animeCover,
        initialAnimeIds: [animeId],
      });
      setNewTitle('');
      setNewDesc('');
      setIsCreatingNew(false);
      showToast(`Коллекция «${created.title}» создана и тайтл добавлен!`);
    } catch (err: any) {
      alert(err.message || 'Ошибка создания');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl p-5 space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <FolderPlus className="w-5 h-5 text-zinc-300 shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-zinc-100 truncate">Добавить в коллекцию</h3>
              <p className="text-[11px] text-zinc-400 truncate">{animeTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-600 text-xs text-zinc-200 animate-in fade-in duration-150">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Collection List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-60">
          {userCollections.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-400 space-y-2">
              <p>У вас пока нет своих коллекций</p>
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
              >
                + Создать первую коллекцию
              </button>
            </div>
          ) : (
            userCollections.map((col) => {
              const isIn = col.animeIds.includes(animeId);
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => handleToggleAnime(col)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    isIn
                      ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:bg-zinc-800/50 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-9 h-12 rounded bg-zinc-900 border border-zinc-700 overflow-hidden shrink-0">
                      {col.coverImage ? (
                        <Image src={col.coverImage} alt={col.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-500">
                          📁
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate text-zinc-100">{col.title}</span>
                        {col.isPublic ? (
                          <span title="Публичная"><Globe className="w-3 h-3 text-zinc-400 shrink-0" /></span>
                        ) : (
                          <span title="Приватная"><Lock className="w-3 h-3 text-zinc-400 shrink-0" /></span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        {col.animeIds.length} тайтлов
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors shrink-0 ml-2 ${
                      isIn
                        ? 'bg-white border-white text-zinc-900'
                        : 'border-zinc-700 text-transparent hover:border-zinc-500'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Create New Form Toggle or Inline Form */}
        {!isCreatingNew ? (
          <button
            type="button"
            onClick={() => setIsCreatingNew(true)}
            className="w-full py-2.5 rounded-lg border border-dashed border-zinc-700 hover:border-zinc-500 text-xs font-semibold text-zinc-300 hover:text-zinc-100 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Создать новую коллекцию</span>
          </button>
        ) : (
          <form onSubmit={handleCreateAndAdd} className="space-y-3 pt-2 border-t border-zinc-800">
            <div className="text-xs font-bold text-zinc-200">Новая коллекция</div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Название коллекции..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
              autoFocus
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Краткое описание (необязательно)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900"
                />
                <span>Публичная коллекция</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-3 py-1 bg-white text-zinc-900 rounded-md text-xs font-semibold hover:bg-zinc-200 disabled:opacity-50 transition-colors"
                >
                  Создать и добавить
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
