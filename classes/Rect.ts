import { Point } from './Point';

export class Rect {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  addWidth(delta: number) {
    return new Rect(this.x, this.y, this.width + delta, this.height);
  }

  addHeight(delta: number) {
    return new Rect(this.x, this.y, this.width, this.height + delta);
  }

  translateTo(delta: Point) {
    return new Rect(this.x + delta.x, this.y + delta.y, this.width, this.height);
  }
}
