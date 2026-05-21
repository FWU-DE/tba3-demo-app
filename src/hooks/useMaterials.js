import { useState, useEffect } from 'react';
import { tba3Api } from '../services/tba3Api';
import { DEMO_MATERIALS } from '../data/demoMaterials';

export const useMaterials = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const response = await tba3Api.getMaterials(params);
        if (!cancelled) { setData(response.data); setIsDemo(false); }
      } catch {
        if (!cancelled) { setData(DEMO_MATERIALS); setIsDemo(true); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return { data, loading, isDemo };
};

export default useMaterials;
