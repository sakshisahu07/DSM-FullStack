import { useEffect, useState } from "react";

/**
 * Mimics initial network latency for skeleton screens.
 * Returns true while "loading", flips to false after `ms`.
 */
export function useFakeLoading(ms = 650) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
