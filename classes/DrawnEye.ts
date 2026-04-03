import { arc, mapRange } from '@/utils/canvas';
import { Point } from './Point';
import { BlinkingModes, Eye, BasicEyeConfig, DragModes } from './Eye';

type DrawnEyeConfig = BasicEyeConfig & {
  lineWidth?: number;
  color?: string;
  id: string;
};

type EyeFollowConfig = {
  point: Point | undefined;
  windowWidth: number;
  windowHeight: number;
};

export class DrawnEye extends Eye {
  color: string;
  lineWidth: number;

  startPoint: Point;
  arcPoint: Point;
  endPoint: Point;

  static readonly DEFAULT_CONFIG: Required<DrawnEyeConfig> = {
    ...Eye.DEFAULT_CONFIG,
    lineWidth: 5,
    color: 'orange',
    id: 'default',
  };

  /** Eyelids need an additional angle in order to actually intersect.
   * Not sure why. */
  static readonly MAGIC_EYELID_RADIUS_FACTOR = 0.93;
  static readonly MAGIC_CORNER_FACTOR = 1.05;

  constructor(config: DrawnEyeConfig) {
    const eyeCornerDist =
      DrawnEye.DEFAULT_CONTOUR_RADIUS *
      Math.sin(Eye.DEFAULT_INCLINATION / 2) *
      DrawnEye.MAGIC_CORNER_FACTOR;

    super({
      ...config,
      width: eyeCornerDist,
      height: config.pupilRadius,
    });

    const { color, lineWidth } = {
      ...DrawnEye.DEFAULT_CONFIG,
      ...config,
    };

    this.color = color;
    this.lineWidth = lineWidth;

    this.startPoint = new Point(-eyeCornerDist, 0);
    this.arcPoint = new Point(0, this.pupilRadius * -2);
    this.endPoint = new Point(eyeCornerDist, 0);
  }

  setupContext(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(this.inclination);
  }

  updateBlink() {
    const { pupilRadius: r } = this;
    const { y } = this.arcPoint;
    const { CLOSING, IDLE, OPENING } = BlinkingModes;

    if (this.blinking === OPENING) {
      if (y < 0) this.arcPoint.y += Eye.BLINK_SPEED;
      else this.blinking = CLOSING;
    } else if (this.blinking === CLOSING) {
      if (Math.abs(y) <= r * 2) this.arcPoint.y -= Eye.BLINK_SPEED;
      else this.blinking = IDLE;
    }
  }

  draw(ctx: CanvasRenderingContext2D, followConfig?: EyeFollowConfig) {
    ctx.save();

    this.setupContext(ctx);

    this.drawContour(ctx);
    this.drawPupils(ctx, {
      point: new Point(0, 0),
      windowHeight: 2,
      windowWidth: 2,
      ...followConfig,
    });

    ctx.restore();
  }

  protected drawPupils(
    ctx: CanvasRenderingContext2D,
    followConfig: EyeFollowConfig,
  ) {
    const { pupilRadius: r, startPoint } = this;
    const { x, y } = followConfig.point ?? new Point();

    ctx.save();
    ctx.resetTransform();
    ctx.translate(this.center.x, this.center.y);

    const mapX =
      -1 *
      mapRange(
        x - this.center.x,
        [0, followConfig.windowWidth],
        [0, startPoint.x],
      );

    const mapY = mapRange(
      y - this.center.y,
      [0, followConfig.windowHeight],
      [0, this.pupilRadius],
    );

    // draw concentric circles
    [...new Array(Eye.NUM_PUPILS).keys()].forEach((i) => {
      const logFactor = Math.log(i + 2) / Math.log(Eye.NUM_PUPILS + 1);
      arc(ctx, mapX, mapY, r * logFactor, 0, Math.PI * 2);
    });

    arc(ctx, mapX, mapY, r * 0.1, 0, 2 * Math.PI);
    ctx.restore();
  }

  private drawContour(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    this.drawContourArc(ctx);
    ctx.rotate(Math.PI);
    this.drawContourArc(ctx);
    ctx.clip();
    ctx.stroke();
    ctx.closePath();
    ctx.rotate(Math.PI);
  }

  private drawContourArc(ctx: CanvasRenderingContext2D) {
    const { startPoint, arcPoint, endPoint } = this;
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.arcTo(
      arcPoint.x,
      arcPoint.y,
      endPoint.x,
      endPoint.y,
      DrawnEye.DEFAULT_CONTOUR_RADIUS * DrawnEye.MAGIC_EYELID_RADIUS_FACTOR,
    );
    ctx.lineTo(endPoint.x, endPoint.y);
  }

  onDrag(mousePos: Point) {
    switch (this.dragMode) {
      case DragModes.UPPER_CENTER:
        this.pupilRadius -= mousePos.subY(this.upperCenter);
        break;
      case DragModes.LEFT_CENTER:
        this.startPoint.x -= mousePos.x - this.leftCenter.x;
        break;
      case DragModes.RIGHT_CENTER:
        this.endPoint.x -= mousePos.x - this.rightCenter.x;
        break;
      case DragModes.BODY:
        this.center = mousePos;
        break;
    }
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

  isHovered(ctx: CanvasRenderingContext2D, mousePos: Point) {
    return ctx.isPointInPath(this.getExternalBoxPath(), mousePos.x, mousePos.y);
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

  drawBoxes(ctx: CanvasRenderingContext2D, mousePos: Point) {
    this.drawExternalBox(ctx);
    this.drawInternalBox(ctx);
    this.vectors.forEach((corner) => {
      corner.draw(ctx, mousePos, { coordinates: false });
    });
    this.corners.forEach((corner) => {
      corner.draw(ctx, mousePos, { coordinates: false });
    });
  }

  drawInternalBox(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.setLineDash([7, 7]);
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(this.inclination);
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
    ctx.fill(this.getBoxPath(false));
    ctx.stroke(this.getBoxPath(false));
    ctx.restore();
  }

  drawExternalBox(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.setLineDash([7, 7]);
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(this.inclination);
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill(this.getExternalBoxPath(false));
    ctx.stroke(this.getExternalBoxPath(false));
    ctx.restore();
  }

  getBoxPath(translated: boolean = true) {
    const boxPath = new Path2D();
    boxPath.rect(
      translated ? this.center.x + this.startPoint.x : this.startPoint.x,
      translated ? this.center.y - this.pupilRadius : -this.pupilRadius,
      this.endPoint.x - this.startPoint.x,
      2 * this.pupilRadius,
    );
    return boxPath;
  }

  getExternalBoxPath(translated: boolean = true) {
    const boxPath = new Path2D();
    boxPath.rect(
      translated
        ? this.center.x + this.startPoint.x - Eye.EXTERNAL_MARGIN
        : this.startPoint.x - Eye.EXTERNAL_MARGIN,
      translated
        ? this.center.y - this.pupilRadius - Eye.EXTERNAL_MARGIN
        : -this.pupilRadius - Eye.EXTERNAL_MARGIN,
      this.endPoint.x - this.startPoint.x + 2 * Eye.EXTERNAL_MARGIN,
      2 * this.pupilRadius + 2 * Eye.EXTERNAL_MARGIN,
    );
    return boxPath;
  }

  protected get corners() {
    return [this.upperLeft, this.upperRight, this.lowerLeft, this.lowerRight];
  }

  protected get vectors() {
    return [this.upperCenter, this.leftCenter, this.rightCenter];
  }

  protected get leftCenter() {
    return this.center.add(this.startPoint);
  }

  protected get rightCenter() {
    return this.center.add(this.endPoint);
  }

  protected get upperLeft() {
    return this.center.addX(this.startPoint.x).addY(-this.pupilRadius);
  }

  protected get upperRight() {
    return this.center.add(this.endPoint).addY(-this.pupilRadius);
  }

  protected get lowerLeft() {
    return this.center.add(this.startPoint).addY(this.pupilRadius);
  }

  protected get lowerRight() {
    return this.center.add(this.endPoint).addY(this.pupilRadius);
  }
}
