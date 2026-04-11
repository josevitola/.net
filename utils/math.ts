/**
 * Map a value from one range to another
 *
 * @param value Value to map
 * @param oldRange Range to map from
 * @param newRange Range to map to
 * @return Mapped value
 */
export function scale(
  value: number,
  [in_min, in_max]: [number, number],
  [out_min, out_max]: [number, number],
) {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
