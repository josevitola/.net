import { Point } from './Point';

export type EyeConfig = {
  id?: string;
};

type EyeFollowConfig = {
  point: Point | undefined;
  windowWidth: number;
  windowHeight: number;
};

enum BlinkingModes {
  IDLE = 'IDLE',
  OPENING = 'OPENING',
  CLOSING = 'CLOSING',
}

enum DragModes {
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
  r: number;
  theta: number = 0;

  id: string;

  startPoint: Point;
  arcPoint: Point;
  endPoint: Point;

  blinking: BlinkingModes;

  dragMode?: DragModes;

  static readonly THETA = Math.PI / 2;
  static readonly BLINK_SPEED = 2;
  static readonly NUM_PUPILS = 3;
  static readonly DEFAULT_CONTOUR_RADIUS = 90;
  static readonly EXTERNAL_MARGIN = 10;
  static readonly INFO_FONT_SIZE = 12;

  static readonly DEFAULT_CONFIG: Required<EyeConfig> = {
    id: 'default',
  };

  static readonly DEFAULT_EYELID_CONFIG: EyelidConfig = {
    dir: LidDirections.UP,
  };

  /** Eyelids need an additional angle in order to actually intersect.
   * Not sure why. */
  static readonly MAGIC_EYELID_RADIUS_FACTOR = 0.93;
  static readonly MAGIC_CORNER_FACTOR = 1.05;

  constructor(x: number, y: number, r: number, config: EyeConfig) {
    const { id } = {
      ...Eye.DEFAULT_CONFIG,
      ...config,
    };

    this.center = new Point(x, y);
    this.r = r;

    this.id = id;

    const eyeCornerDist =
      Eye.DEFAULT_CONTOUR_RADIUS *
      Math.sin(Eye.THETA / 2) *
      Eye.MAGIC_CORNER_FACTOR;

    this.startPoint = new Point(-eyeCornerDist, 0);
    this.arcPoint = new Point(0, r * -2);
    this.endPoint = new Point(eyeCornerDist, 0);

    this.blinking = BlinkingModes.IDLE;
  }

  setupContext(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(this.theta);
  }

  onDrag(mousePos: Point) {
    switch (this.dragMode) {
      case DragModes.UPPER_CENTER:
        this.r -= mousePos.subY(this.upperCenter);
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

  startBlinking() {
    const { IDLE, OPENING } = BlinkingModes;

    if (this.blinking === IDLE) this.blinking = OPENING;
  }

  updateBlink() {
    const { r } = this;
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

  abstract draw(
    ctx: CanvasRenderingContext2D,
    followConfig?: EyeFollowConfig,
  ): void;

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

  drawInfo(ctx: CanvasRenderingContext2D) {
    ctx.font = `${Eye.INFO_FONT_SIZE}px Arial`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(
      this.id,
      this.lowerCenter.x,
      this.lowerCenter.y + Eye.INFO_FONT_SIZE + Eye.EXTERNAL_MARGIN * 1.5,
    );
  }

  drawInternalBox(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.setLineDash([7, 7]);
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(this.theta);

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
    ctx.rotate(this.theta);

    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill(this.getExternalBoxPath(false));
    ctx.stroke(this.getExternalBoxPath(false));

    ctx.restore();
  }

  protected get corners() {
    return [this.upperLeft, this.upperRight, this.lowerLeft, this.lowerRight];
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

  isHovered(ctx: CanvasRenderingContext2D, mousePos: Point) {
    return ctx.isPointInPath(this.getExternalBoxPath(), mousePos.x, mousePos.y);
  }

  getBoxPath(translated: boolean = true) {
    const boxPath = new Path2D();
    boxPath.rect(
      translated ? this.center.x + this.startPoint.x : this.startPoint.x,
      translated ? this.center.y - this.r : -this.r,
      this.endPoint.x - this.startPoint.x,
      2 * this.r,
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
        ? this.center.y - this.r - Eye.EXTERNAL_MARGIN
        : -this.r - Eye.EXTERNAL_MARGIN,
      this.endPoint.x - this.startPoint.x + 2 * Eye.EXTERNAL_MARGIN,
      2 * this.r + 2 * Eye.EXTERNAL_MARGIN,
    );
    return boxPath;
  }

  protected get vectors() {
    return [this.upperCenter, this.leftCenter, this.rightCenter];
  }

  protected get upperCenter() {
    return this.center.addY(-this.r);
  }

  protected get lowerCenter() {
    return this.center.addY(this.r);
  }

  protected get leftCenter() {
    return this.center.add(this.startPoint);
  }

  protected get rightCenter() {
    return this.center.add(this.endPoint);
  }

  protected get upperLeft() {
    return this.center.addX(this.startPoint.x).addY(-this.r);
  }

  protected get upperRight() {
    return this.center.add(this.endPoint).addY(-this.r);
  }

  protected get lowerLeft() {
    return this.center.add(this.startPoint).addY(this.r);
  }

  protected get lowerRight() {
    return this.center.add(this.endPoint).addY(this.r);
  }

  protected abstract drawPupils(
    ctx: CanvasRenderingContext2D,
    followConfig: EyeFollowConfig,
  ): void;
}
