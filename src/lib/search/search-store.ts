// Global search state manager for opening/closing the search modal from any button/key/component

type SearchListener = (isOpen: boolean) => void;
const listeners = new Set<SearchListener>();
let isSearchModalOpen = false;

export const searchStore = {
  isOpen: () => isSearchModalOpen,
  open: () => {
    isSearchModalOpen = true;
    listeners.forEach((l) => l(true));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kuronami:open-search'));
    }
  },
  close: () => {
    isSearchModalOpen = false;
    listeners.forEach((l) => l(false));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kuronami:close-search'));
    }
  },
  toggle: () => {
    if (isSearchModalOpen) {
      searchStore.close();
    } else {
      searchStore.open();
    }
  },
  subscribe: (listener: SearchListener) => {
    listeners.add(listener);
    listener(isSearchModalOpen);
    return () => {
      listeners.delete(listener);
    };
  },
};
