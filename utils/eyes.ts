import { DrawnEye, ImageEye, ImageEyeAssets, Point } from '@/classes';
import { randomInRange } from './math';

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
  cornea,
  pupil,
  width,
  height,
}: ImageEyeAssets & {
  width: number;
  height: number;
}) {
  if (!cornea.img.complete || !pupil.img.complete) return [];
  return [
    new ImageEye({
      cornea: cornea,
      pupil: pupil,
      center: new Point(width / 2, height / 2),
      pupilRadius: 30,
    }),
  ];
}

export type CreateRandomEyesParams = {
  assets: ImageEyeAssets[];
  count: number;
  canvasWidth: number;
  canvasHeight: number;
};

export function chaoticallyCreateRandomEyes({
  assets,
  count,
  canvasWidth,
  canvasHeight,
}: CreateRandomEyesParams): ImageEye[] {
  const eyes: ImageEye[] = [];
  for (let i = 0; i < count; i++) {
    const asset = assets[Math.floor(Math.random() * assets.length)];
    eyes.push(
      new ImageEye({
        cornea: asset.cornea,
        pupil: asset.pupil,
        center: new Point(Math.random() * canvasWidth, Math.random() * canvasHeight),
        pupilRadius: 30,
      }),
    );
  }
  return eyes;
}

function createEyesInGrid({ assets, count, canvasWidth, canvasHeight }: CreateRandomEyesParams) {
  const eyes: ImageEye[] = [];
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const horizontalSpacing = canvasWidth / (cols + 1);
  const verticalSpacing = canvasHeight / (rows + 1);
  let eyeIndex = 0;
  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      if (eyeIndex >= count) break;
      const asset = assets[Math.floor(Math.random() * assets.length)];
      asset.cornea.width = 100;
      asset.pupil.width = 50;
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

function randomlyCreateRandomEyes({
  assets,
  count,
  canvasWidth,
  canvasHeight,
}: CreateRandomEyesParams) {
  const eyes: ImageEye[] = [];
  for (let i = 0; i < count; i++) {
    const asset = { ...assets[Math.floor(Math.random() * assets.length)] };
    const x = Math.random() * canvasWidth;
    const y = Math.random() * canvasHeight;
    const inclination = randomInRange(-Math.PI / 2, Math.PI / 2);
    asset.cornea.width = randomInRange(50, 150);
    asset.pupil.width = randomInRange(asset.cornea.height * 0.7, asset.cornea.height * 1.3);
    eyes.push(
      new ImageEye({
        cornea: asset.cornea,
        pupil: asset.pupil,
        center: new Point(x, y),
        pupilRadius: 30,
        inclination,
      }),
    );
  }
  return eyes;
}

export function generateEyeList({
  assets,
  count,
  canvasWidth,
  canvasHeight,
  mode,
}: CreateRandomEyesParams & {
  mode: 'chaotic' | 'grid' | 'random';
}): ImageEye[] {
  switch (mode) {
    case 'chaotic':
      return chaoticallyCreateRandomEyes({ assets, count, canvasWidth, canvasHeight });
    case 'grid':
      return createEyesInGrid({ assets, count, canvasWidth, canvasHeight });
    case 'random':
      return randomlyCreateRandomEyes({ assets, count, canvasWidth, canvasHeight });
    default:
      return chaoticallyCreateRandomEyes({ assets, count, canvasWidth, canvasHeight });
  }
}
