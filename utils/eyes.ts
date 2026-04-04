import { DrawnEye, ImageEye, Point } from '@/classes';

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
          id: `${(i - 1) * cols + j}`,
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
      corneaImage,
      pupilImage,
      center: new Point(width / 2, height / 2),
      id: '1',
      pupilRadius: 30,
    }),
  ];
}
