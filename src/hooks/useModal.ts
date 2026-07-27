import { useState, useCallback, useEffect } from 'react';

interface ModalState {
  open: boolean;
  title: string;
  body: string;
  footer: string;
}

const DEFAULT: ModalState = { open: false, title: '', body: '', footer: '' };

export function useModal() {
  const [state, setState] = useState<ModalState>(DEFAULT);

  const open = useCallback((title: string, body: string, footer?: string) => {
    setState({ open: true, title, body, footer: footer || '' });
  }, []);

  const close = useCallback(() => {
    setState(DEFAULT);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && state.open) close();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [state.open, close]);

  return { ...state, open, close };
}
