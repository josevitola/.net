import { picoid } from '@/utils/random';
import { Point } from '../Point';
import { mapToRange } from '@/utils/math';
import { Rect } from '../Rect';

export type EssentialEyeProps = Pick<Eye, 'center' | 'pupilRadius' | 'inclination'>;

export type EyeProps = EssentialEyeProps & Pick<Eye, 'width' | 'height'>;

export type EyeFollowConfig = {
  follow: Point | undefined;
  windowWidth: number;
  windowHeight: number;
};

export enum BlinkingModes {
  IDLE = 'IDLE',
  OPENING = 'OPENING',
  CLOSING = 'CLOSING',
}

export enum DragModes {
  UPPER_CENTER = 'UPPER_CENTER',
  LEFT_CENTER = 'LEFT_CENTER',
  RIGHT_CENTER = 'RIGHT_CENTER',
  BODY = 'BODY',
}

enum LidDirections {
  UP = 'UP',
  DOWN = 'DOWN',
}

type EyelidConfig = {
  dir: LidDirections;
};

export abstract class Eye {
  center: Point;
  pupilRadius: number;
  inclination: number = 0;

  width: number;
  height: number;

  id = picoid();

  blinking: BlinkingModes;

  dragMode?: DragModes;

  private _info: string = '';

  static readonly DEFAULT_INCLINATION = Math.PI / 2;
  static readonly BLINK_SPEED = 2;
  static readonly NUM_PUPILS = 3;
  static readonly DEFAULT_CONTOUR_RADIUS = 90;
  static readonly EXTERNAL_MARGIN = 10;
  static readonly INFO_FONT_SIZE = 12;

  static readonly DEFAULT_ABSTRACT_CONFIG: Required<EyeProps> = {
    center: new Point(0, 0),
    pupilRadius: 0,
    width: 0,
    height: 0,
    inclination: 0,
  };

  static readonly DEFAULT_EYELID_CONFIG: EyelidConfig = {
    dir: LidDirections.UP,
  };

  constructor(config: Partial<EyeProps>) {
    const { center, pupilRadius, width, height, inclination } = {
      ...Eye.DEFAULT_ABSTRACT_CONFIG,
      ...config,
    };

    this.center = center;
    this.pupilRadius = pupilRadius;
    this.width = width;
    this.height = height;
    this.inclination = inclination;

    this.blinking = BlinkingModes.IDLE;
  }

  draw(ctx: CanvasRenderingContext2D, followConfig?: EyeFollowConfig) {
    ctx.save();
    this.setupContext(ctx);
    this.drawContour(ctx);
    this.drawPupil(ctx, {
      follow: new Point(0, 0),
      windowHeight: 2,
      windowWidth: 2,
      ...followConfig,
    });
    ctx.restore();
  }

  abstract updateBlink(): void;

  protected abstract drawPupil(ctx: CanvasRenderingContext2D, followConfig: EyeFollowConfig): void;

  protected abstract drawContour(ctx: CanvasRenderingContext2D): void;

  setupContext(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(this.inclination);
  }

  startBlinking() {
    const { IDLE, OPENING } = BlinkingModes;

    if (this.blinking === IDLE) this.blinking = OPENING;
  }

  drawInfo(ctx: CanvasRenderingContext2D) {
    ctx.font = `${Eye.INFO_FONT_SIZE}px Arial`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(
      this.info,
      this.lowerCenter.x,
      this.lowerCenter.y + Eye.INFO_FONT_SIZE + Eye.EXTERNAL_MARGIN * 1.5,
    );
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

  isHovered(ctx: CanvasRenderingContext2D, mousePos: Point) {
    return ctx.isPointInPath(this.getExternalBoxPath(this.upperLeft), mousePos.x, mousePos.y);
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

  onDragEnd() {
    this.dragMode = undefined;
  }

  get rect(): Rect {
    return this.originRect.translateTo(this.upperLeft);
  }

  get originRect(): Rect {
    return new Rect(0, 0, this.width, this.height);
  }

  get originMidpoints() {
    return [
      new Point(0, -this.height / 2),
      new Point(-this.width / 2, 0),
      new Point(this.width / 2, 0),
    ];
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
      .translateTo(startPoint.add(new Point(-Eye.EXTERNAL_MARGIN, -Eye.EXTERNAL_MARGIN)))
      .addWidth(2 * Eye.EXTERNAL_MARGIN)
      .addHeight(2 * Eye.EXTERNAL_MARGIN);
    boxPath.rect(x, y, width, height);
    return boxPath;
  }

  updateCursor(ctx: CanvasRenderingContext2D, mousePos: Point) {
    let cursor = '';
    if (this.upperLeft.isHovered(mousePos)) {
      cursor = 'url("/cursors/curved-arrow.png") 8 8, auto';
    } else if (this.upperRight.isHovered(mousePos)) {
      cursor = 'url("/cursors/curved-arrow-90.png") 8 8, auto';
    } else if (this.lowerLeft.isHovered(mousePos)) {
      cursor = 'url("/cursors/curved-arrow-270.png") 8 8, auto';
    } else if (this.lowerRight.isHovered(mousePos)) {
      cursor = 'url("/cursors/curved-arrow-180.png") 8 8, auto';
    } else if (this.upperCenter.isHovered(mousePos)) {
      cursor = 'n-resize';
    } else if (this.leftCenter.isHovered(mousePos)) {
      cursor = 'w-resize';
    } else if (this.rightCenter.isHovered(mousePos)) {
      cursor = 'e-resize';
    } else if (this.isHovered(ctx, mousePos)) {
      cursor = 'grab';
    }
    ctx.canvas.style.cursor = cursor;
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

  protected get lowerRight() {
    return this.center.addX(this.width / 2).addY(this.height / 2);
  }

  protected calcPupilPositionToEyeCenter(followConfig: EyeFollowConfig) {
    const { x, y } = followConfig.follow ?? new Point();

    const mappedX = mapToRange(
      x - this.center.x,
      [0, followConfig.windowWidth / 2],
      [0, this.width / 2 - this.pupilRadius],
    );

    const mappedY = mapToRange(
      y - this.center.y,
      [0, followConfig.windowHeight / 2],
      [0, this.pupilRadius],
    );

    return { x: mappedX, y: mappedY };
  }
}
