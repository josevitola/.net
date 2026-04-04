'use client';

import { useEffect, useRef, useState } from 'react';

export function useImage({ path }: { path: string }) {
  const [ready, setReady] = useState(false);
  const image = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = path;
    image.current = img;
    img.onload = () => setReady(true);
  }, [path]);

  return { image, ready };
}
