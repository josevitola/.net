import { useImage } from '@/hooks/client';
import { useMemo } from 'react';

export function useEyeImages() {
  const { image: cornea1, ready: cornea1Rdy } = useImage({ path: '/cornea1.png' });
  const { image: pupil1, ready: pupil1Rdy } = useImage({ path: '/pupil1.png' });
  const { image: cornea2, ready: cornea2Rdy } = useImage({ path: '/cornea2.png' });
  const { image: pupil2, ready: pupil2Rdy } = useImage({ path: '/pupil2.png' });

  const ready = useMemo(
    () => cornea1Rdy && pupil1Rdy && cornea2Rdy && pupil2Rdy,
    [cornea1Rdy, pupil1Rdy, cornea2Rdy, pupil2Rdy],
  );

  const images = useMemo(
    () => [
      { cornea: cornea1, pupil: pupil1 },
      { cornea: cornea2, pupil: pupil2 },
    ],
    [cornea1, pupil1, cornea2, pupil2],
  );

  return { images, ready };
}
