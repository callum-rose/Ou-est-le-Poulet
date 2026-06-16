import { useEffect, useState } from 'react';

/** True while the document is foregrounded/visible. */
export function usePageVisibility(): boolean {
  const [visible, setVisible] = useState(
    () => typeof document === 'undefined' || !document.hidden,
  );

  useEffect(() => {
    const onChange = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return visible;
}
