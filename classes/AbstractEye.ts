import { Point } from './Point';

export type BasicEyeConfig = Pick<AbstractEye, 'center' | 'id' | 'pupilRadius'>;

type AbstractEyeConfig = BasicEyeConfig & Pick<AbstractEye, 'width' | 'height'>;

export type EyeFollowConfig = {
  point: Point | undefined;
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

export abstract class AbstractEye {
  center: Point;
  pupilRadius: number;
  inclination: number = 0;

  width: number;
  height: number;

  id: string;

  blinking: BlinkingModes;

  dragMode?: DragModes;

  static readonly DEFAULT_INCLINATION = Math.PI / 2;
  static readonly BLINK_SPEED = 2;
  static readonly NUM_PUPILS = 3;
  static readonly DEFAULT_CONTOUR_RADIUS = 90;
  static readonly EXTERNAL_MARGIN = 10;
  static readonly INFO_FONT_SIZE = 12;

  static readonly DEFAULT_CONFIG: Required<BasicEyeConfig> = {
    id: 'default',
    center: new Point(0, 0),
    pupilRadius: 0,
  };

  static readonly DEFAULT_EYELID_CONFIG: EyelidConfig = {
    dir: LidDirections.UP,
  };

  constructor(config: AbstractEyeConfig) {
    const { center, id, pupilRadius, width, height } = {
      ...AbstractEye.DEFAULT_CONFIG,
      ...config,
    };

    this.center = center;
    this.pupilRadius = pupilRadius;
    this.width = width;
    this.height = height;

    this.id = id;

    this.blinking = BlinkingModes.IDLE;
  }

  abstract draw(
    ctx: CanvasRenderingContext2D,
    followConfig?: EyeFollowConfig,
  ): void;

  abstract updateBlink(): void;

  protected abstract drawPupils(
    ctx: CanvasRenderingContext2D,
    followConfig: EyeFollowConfig,
  ): void;

  setupContext(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(this.inclination);
  }

  startBlinking() {
    const { IDLE, OPENING } = BlinkingModes;

    if (this.blinking === IDLE) this.blinking = OPENING;
  }

  drawInfo(ctx: CanvasRenderingContext2D) {
    ctx.font = `${AbstractEye.INFO_FONT_SIZE}px Arial`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(
      this.id,
      this.lowerCenter.x,
      this.lowerCenter.y +
        AbstractEye.INFO_FONT_SIZE +
        AbstractEye.EXTERNAL_MARGIN * 1.5,
    );
  }

  protected get upperCenter() {
    return this.center.addY(-this.pupilRadius);
  }

  protected get lowerCenter() {
    return this.center.addY(this.pupilRadius);
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
    return ctx.isPointInPath(this.getExternalBoxPath(), mousePos.x, mousePos.y);
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
    ctx.rotate(this.inclination);
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
    ctx.fill(this.getBoxPath());
    ctx.stroke(this.getBoxPath());
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

  private drawExternalBox(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.setLineDash([7, 7]);
    ctx.rotate(this.inclination);
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill(this.getExternalBoxPath());
    ctx.stroke(this.getExternalBoxPath());
    ctx.restore();
  }

  getBoxPath() {
    const boxPath = new Path2D();
    boxPath.rect(this.upperLeft.x, this.upperLeft.y, this.width, this.height);
    return boxPath;
  }

  getExternalBoxPath() {
    const boxPath = new Path2D();
    boxPath.rect(
      this.upperLeft.x - AbstractEye.EXTERNAL_MARGIN,
      this.upperLeft.y - AbstractEye.EXTERNAL_MARGIN,
      this.width + 2 * AbstractEye.EXTERNAL_MARGIN,
      this.height + 2 * AbstractEye.EXTERNAL_MARGIN,
    );
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

  protected get vectors() {
    return [this.upperCenter, this.leftCenter, this.rightCenter];
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
}
