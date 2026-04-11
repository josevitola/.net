/**
 * Map a value from one range to another
 *
 * @param value Value to map
 * @param oldRange Range to map from
 * @param newRange Range to map to
 * @return Mapped value
 */
export function toNewRange(
  value: number,
  [inMin, inMax]: [number, number],
  [outMin, outMax]: [number, number],
) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function toNextOdd(value: number): number {
  return value % 2 === 0 ? value + 1 : value;
}