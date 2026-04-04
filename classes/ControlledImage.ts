export class ControlledImage {
  img: HTMLImageElement;
  _width: number | null;

  constructor(img: HTMLImageElement, width: number | null = null) {
    this.img = img;
    this._width = width;
  }

  get width(): number {
    return this._width ?? this.img.width;
  }

  get height(): number {
    return this.width === null ? this.img.height : (this.width / this.img.width) * this.img.height;
  }

  set width(value: number | null) {
    this._width = value;
  }
}
