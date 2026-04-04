import { arc, mapRange } from '@/utils/canvas';
import { Point } from './Point';
import {
  BlinkingModes,
  AbstractEye,
  BasicEyeConfig,
  DragModes,
} from './AbstractEye';

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

export class DrawnEye extends AbstractEye {
  color: string;
  lineWidth: number;

  startPoint: Point;
  arcPoint: Point;
  endPoint: Point;

  static readonly DEFAULT_CONFIG: Required<DrawnEyeConfig> = {
    ...AbstractEye.DEFAULT_CONFIG,
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
      Math.sin(AbstractEye.DEFAULT_INCLINATION / 2) *
      DrawnEye.MAGIC_CORNER_FACTOR;

    super({
      ...config,
      width: eyeCornerDist * 2,
      height: config.pupilRadius * 2,
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
      if (y < 0) this.arcPoint.y += AbstractEye.BLINK_SPEED;
      else this.blinking = CLOSING;
    } else if (this.blinking === CLOSING) {
      if (Math.abs(y) <= r * 2) this.arcPoint.y -= AbstractEye.BLINK_SPEED;
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
    [...new Array(AbstractEye.NUM_PUPILS).keys()].forEach((i) => {
      const logFactor = Math.log(i + 2) / Math.log(AbstractEye.NUM_PUPILS + 1);
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
}
