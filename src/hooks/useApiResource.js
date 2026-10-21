import { useEffect, useState } from 'react';

// Pass a stable function (module-level or useCallback) to avoid repeated requests.
export default function useApiResource(load) {
  const [attempt, setAttempt] = useState(0);
  const [resource, setResource] = useState({ status: 'loading', data: null, error: null });
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setResource({ status: 'loading', data: null, error: null });
    async function fetchData() {
      try {
        const data = await load({ signal: controller.signal });
        if (!cancelled) setResource({ status: 'success', data, error: null });
      } catch (error) {
        if (!cancelled) setResource({ status: 'error', data: null, error });
      }
    }
    fetchData();
    return () => { cancelled = true; controller.abort(); };
  }, [load, attempt]);
  return { ...resource, retry: () => setAttempt((value) => value + 1) };
}
