import { useCallback, useEffect, useState } from 'react';
import type { ToastMessage } from '@/types/audit';

type Listener = (toasts: ToastMessage[]) => void;

const listeners = new Set<Listener>();
let state: ToastMessage[] = [];
const MAX = 3;

function emit() {
  for (const l of listeners) l(state);
}

function push(toast: Omit<ToastMessage, 'id'>) {
  const id = Math.random().toString(36).slice(2, 9);
  const next = [{ ...toast, id }, ...state].slice(0, MAX);
  state = next;
  emit();
  const ttl = toast.variant === 'error' ? 6000 : 4000;
  setTimeout(() => dismiss(id), ttl);
  return id;
}

function dismiss(id: string) {
  state = state.filter((t) => t.id !== id);
  emit();
}

export const toast = {
  success: (title: string, description?: string) => push({ title, description, variant: 'success' }),
  error: (title: string, description?: string) => push({ title, description, variant: 'error' }),
  info: (title: string, description?: string) => push({ title, description, variant: 'info' }),
  dismiss,
};

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>(state);

  useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  const remove = useCallback((id: string) => dismiss(id), []);

  return { toasts, remove };
}
