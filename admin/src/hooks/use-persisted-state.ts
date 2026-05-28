import { useEffect, useRef, useState } from "react";

const PREFIX = "dsm_tbl:";

export function usePersistedState<T>(key: string | undefined, initial: T) {
  const fullKey = key ? PREFIX + key : undefined;
  const [value, setValue] = useState<T>(() => {
    if (!fullKey || typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(fullKey);
      if (raw == null) return initial;
      return { ...(initial as object), ...JSON.parse(raw) } as T;
    } catch {
      return initial;
    }
  });

  const first = useRef(true);
  useEffect(() => {
    if (!fullKey) return;
    if (first.current) { first.current = false; return; }
    try {
      window.localStorage.setItem(fullKey, JSON.stringify(value));
    } catch {
      /* ignore quota */
    }
  }, [fullKey, value]);

  return [value, setValue] as const;
}
