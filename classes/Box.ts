import { picoid } from "@/utils/random";
import { Point } from "./Point";
import { Rect } from "./Rect";

type BoxProps = {
  center: Point;
  width: number;
  height: number;
  inclination: number;
};

export enum DragModes {
  UPPER_CENTER = 'UPPER_CENTER',
  LEFT_CENTER = 'LEFT_CENTER',
  RIGHT_CENTER = 'RIGHT_CENTER',
  BODY = 'BODY',
}

export class Box {
  id = picoid();

  center: Point;
  width: number;
  height: number;
  inclination: number = 0;
  dragMode?: DragModes;

  private _info: string = '';

  static readonly INFO_FONT_SIZE = 12;
  static readonly EXTERNAL_MARGIN = 10;
  static readonly DEFAULT_INCLINATION = Math.PI / 2;

  static readonly DEFAULT_PROPS: Required<BoxProps> = {
    center: new Point(0, 0),
    width: 0,
    height: 0,
    inclination: 0,
  };

  constructor(props: Partial<BoxProps>) {
    const { center, width, height, inclination } = {
      ...Box.DEFAULT_PROPS,
      ...props,
    };

    this.center = center;
    this.width = width;
    this.height = height;
    this.inclination = inclination;
  }

  get rect(): Rect {
    return this.originRect.translateTo(this.upperLeft);
  }

  get originMidpoints() {
    return [
      new Point(0, -this.height / 2),
      new Point(-this.width / 2, 0),
      new Point(this.width / 2, 0),
    ];
  }

  get originRect(): Rect {
    return new Rect(0, 0, this.width, this.height);
  }

  drawInfo(ctx: CanvasRenderingContext2D) {
    ctx.font = `${Box.INFO_FONT_SIZE}px Arial`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(
      this.info,
      this.lowerCenter.x,
      this.lowerCenter.y + Box.INFO_FONT_SIZE + Box.EXTERNAL_MARGIN * 1.5,
    );
  }

  drawBoxes(ctx: CanvasRenderingContext2D, mousePos: Point) {
    this.drawExternalBox(ctx);
    this.drawInternalBox(ctx);
    this.drawCorners(ctx, mousePos);
    this.drawMidpoints(ctx, mousePos);
  }

  drawCorners(ctx: CanvasRenderingContext2D, mousePos: Point) {
    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(this.inclination);
    this.originCorners.forEach((corner) => {
      corner.draw(ctx, mousePos, { coordinates: false });
    });
    ctx.restore();
  }

  drawMidpoints(ctx: CanvasRenderingContext2D, mousePos: Point) {
    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(this.inclination);
    this.originMidpoints.forEach((midpoint) => {
      midpoint.draw(ctx, mousePos, { coordinates: false });
    });
    ctx.restore();
  }

  drawInternalBox(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.setLineDash([7, 7]);
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(this.inclination);
    const startPoint = new Point(-this.width / 2, -this.height / 2);
    ctx.fill(this.getBoxPath(startPoint));
    ctx.stroke(this.getBoxPath(startPoint));
    ctx.restore();
  }

  getBoxPath(startPoint: Point = new Point()): Path2D {
    const boxPath = new Path2D();
    const { x, y, width, height } = this.originRect.translateTo(startPoint);
    boxPath.rect(x, y, width, height);
    return boxPath;
  }

  getExternalBoxPath(startPoint: Point = new Point()) {
    const boxPath = new Path2D();
    const { x, y, width, height } = this.originRect
      .translateTo(startPoint.add(new Point(-Box.EXTERNAL_MARGIN, -Box.EXTERNAL_MARGIN)))
      .addWidth(2 * Box.EXTERNAL_MARGIN)
      .addHeight(2 * Box.EXTERNAL_MARGIN);
    boxPath.rect(x, y, width, height);
    return boxPath;
  }

  protected get lowerRight() {
    return this.center.addX(this.width / 2).addY(this.height / 2);
  }

  protected get info() {
    return this._info || this.debugInfo;
  }

  protected set info(value: string) {
    this._info = value;
  }

  protected get debugInfo() {
    return `${this.id} (${(this.inclination / Math.PI).toFixed(2)}π)`;
  }

  protected get upperCenter() {
    return this.center.addY(-this.height / 2);
  }

  protected get lowerCenter() {
    return this.center.addY(this.height / 2);
  }

  protected get corners() {
    return [this.upperLeft, this.upperRight, this.lowerLeft, this.lowerRight];
  }

  protected get originCorners() {
    return [
      new Point(-this.width / 2, -this.height / 2),
      new Point(this.width / 2, -this.height / 2),
      new Point(-this.width / 2, this.height / 2),
      new Point(this.width / 2, this.height / 2),
    ];
  }

  protected get leftCenter() {
    return this.center.addX(-this.width / 2);
  }

  protected get rightCenter() {
    return this.center.addX(this.width / 2);
  }

  protected get upperLeft() {
    return this.center.addX(-this.width / 2).addY(-this.height / 2);
  }

  protected get upperRight() {
    return this.center.addX(this.width / 2).addY(-this.height / 2);
  }

  protected get lowerLeft() {
    return this.center.addX(-this.width / 2).addY(this.height / 2);
  }

  private drawExternalBox(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.setLineDash([7, 7]);
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(this.inclination);
    const startPoint = new Point(-this.width / 2, -this.height / 2);
    ctx.fill(this.getExternalBoxPath(startPoint));
    ctx.stroke(this.getExternalBoxPath(startPoint));
    ctx.restore();
  }


  onDragStart(ctx: CanvasRenderingContext2D, mousePos: Point) {
    if (this.upperCenter.isHovered(mousePos)) {
      this.dragMode = DragModes.UPPER_CENTER;
    } else if (this.leftCenter.isHovered(mousePos)) {
      this.dragMode = DragModes.LEFT_CENTER;
    } else if (this.rightCenter.isHovered(mousePos)) {
      this.dragMode = DragModes.RIGHT_CENTER;
    } else if (this.isHovered(ctx, mousePos)) {
      this.dragMode = DragModes.BODY;
    }
  }

  onDrag(mousePos: Point) {
    switch (this.dragMode) {
      case DragModes.UPPER_CENTER:
        this.height -= mousePos.y - this.upperCenter.y;
        break;
      case DragModes.LEFT_CENTER:
        this.width -= mousePos.x - this.leftCenter.x;
        break;
      case DragModes.RIGHT_CENTER:
        this.width += mousePos.x - this.rightCenter.x;
        break;
      case DragModes.BODY:
        this.center = mousePos;
        break;
    }
  }

  onDragEnd() {
    this.dragMode = undefined;
  }

  isHovered(ctx: CanvasRenderingContext2D, mousePos: Point) {
    return ctx.isPointInPath(this.getExternalBoxPath(this.upperLeft), mousePos.x, mousePos.y);
  }
}