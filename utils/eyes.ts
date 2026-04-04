import { DrawnEye, ImageEye, Point } from '@/classes';
import { EyeAsset } from '@/types/eyes';

interface InitializeEyesParams {
  width: number;
  height: number;
  radius: number;
  rows: number;
  cols: number;
  lineWidth: number;
}

export function generateDrawnEyes({
  cols,
  height,
  lineWidth,
  radius,
  rows,
  width,
}: InitializeEyesParams): DrawnEye[] {
  const eyes: DrawnEye[] = [];
  for (let i = 1; i < rows + 1; i++) {
    for (let j = 1; j < cols + 1; j++) {
      const x = ((2 * i - 1) * width) / (2 * rows),
        y = ((2 * j - 1) * height) / (2 * cols);
      eyes.push(
        new DrawnEye({
          center: new Point(x, y),
          pupilRadius: radius,
          lineWidth,
        }),
      );
    }
  }
  return eyes;
}
export function initializeDrawnEyes({ width, height }: { width: number; height: number }) {
  return generateDrawnEyes({
    width,
    height,
    cols: 3,
    rows: 3,
    lineWidth: 2,
    radius: 30,
  });
}

export function initializeImageEyes({
  corneaImage,
  pupilImage,
  width,
  height,
}: {
  corneaImage: HTMLImageElement | null;
  pupilImage: HTMLImageElement | null;
  width: number;
  height: number;
}) {
  if (!corneaImage || !pupilImage) return [];
  return [
    new ImageEye({
      cornea: corneaImage,
      pupil: pupilImage,
      center: new Point(width / 2, height / 2),
      pupilRadius: 30,
    }),
  ];
}

export function chaoticallyCreateRandomEyes({
  assets,
  count,
  width,
  height,
}: {
  assets: EyeAsset[];
  count: number;
  width: number;
  height: number;
}): ImageEye[] {
  const eyes: ImageEye[] = [];
  for (let i = 0; i < count; i++) {
    const asset = assets[Math.floor(Math.random() * assets.length)];
    eyes.push(
      new ImageEye({
        cornea: asset.cornea,
        pupil: asset.pupil,
        center: new Point(Math.random() * width, Math.random() * height),
        pupilRadius: 30,
      }),
    );
  }
  return eyes;
}

export function createRandomEyes({
  assets,
  count,
  width,
  height,
  mode,
}: {
  assets: EyeAsset[];
  count: number;
  width: number;
  height: number;
  mode: 'chaotic' | 'normal';
}): ImageEye[] {
  switch (mode) {
    case 'chaotic':
      return chaoticallyCreateRandomEyes({ assets, count, width, height });
    case 'normal':
      const eyes: ImageEye[] = [];
      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);
      const horizontalSpacing = width / (cols + 1);
      const verticalSpacing = height / (rows + 1);
      let eyeIndex = 0;
      for (let i = 1; i <= rows; i++) {
        for (let j = 1; j <= cols; j++) {
          if (eyeIndex >= count) break;
          const asset = assets[Math.floor(Math.random() * assets.length)];
          eyes.push(
            new ImageEye({
              cornea: asset.cornea,
              pupil: asset.pupil,
              center: new Point(j * horizontalSpacing, i * verticalSpacing),
              pupilRadius: 30,
            }),
          );
          eyeIndex++;
        }
      }
      return eyes;
  }
}
