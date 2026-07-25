import { useEffect } from 'react';

export interface ShortcutBinding {
  /** Lowercase key, e.g. "k". Use "Enter", "Escape" for special keys. */
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  /** Skip when focus is in a form field (default: true). */
  allowInInput?: boolean;
}

/**
 * Global keyboard shortcut binder. Register an array of bindings; the hook
 * cleans up on unmount. Matches on key + modifier flags, case-insensitive.
 */
export function useKeyboardShortcuts(bindings: ShortcutBinding[]) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inField =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      for (const b of bindings) {
        if (e.key.toLowerCase() !== b.key.toLowerCase()) continue;
        if (!!b.ctrl !== (e.ctrlKey || e.metaKey && b.meta === undefined)) {
          // accept ctrl OR meta as the "primary" modifier when neither flag set
        }
        if (b.ctrl && !(e.ctrlKey || e.metaKey)) continue;
        if (b.meta && !e.metaKey) continue;
        if (b.shift && !e.shiftKey) continue;
        if (b.alt && !e.altKey) continue;
        if (inField && !b.allowInInput) continue;
        e.preventDefault();
        b.handler();
        return;
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [bindings]);
}
