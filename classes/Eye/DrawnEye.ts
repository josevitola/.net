import { Point } from '../Point';
import { arc } from '@/utils/draw';
import { BlinkingModes, Eye, EyeFollowConfig, EssentialEyeProps } from './Eye';

type DrawnEyeProps = EssentialEyeProps & {
  lineWidth?: number;
  color?: string;
};

export class DrawnEye extends Eye {
  color: string;
  lineWidth: number;

  startPoint: Point;
  arcPoint: Point;
  endPoint: Point;

  static readonly DEFAULT_CONFIG: Required<DrawnEyeProps> = {
    ...Eye.DEFAULT_ABSTRACT_CONFIG,
    lineWidth: 5,
    color: 'orange',
    id: 'default',
  };

  /** Eyelids need an additional angle in order to actually intersect.
   * Not sure why. */
  static readonly MAGIC_EYELID_RADIUS_FACTOR = 0.93;
  static readonly MAGIC_CORNER_FACTOR = 1.05;

  constructor(config: DrawnEyeProps) {
    const eyeCornerDist =
      DrawnEye.DEFAULT_CONTOUR_RADIUS *
      Math.sin(Eye.DEFAULT_INCLINATION / 2) *
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
    super.setupContext(ctx);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
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

  protected drawPupil(ctx: CanvasRenderingContext2D, followConfig: EyeFollowConfig) {
    const { pupilRadius: r } = this;
    const { x: pupilX, y: pupilY } = this.calculatePupilPosition(followConfig);

    ctx.save();
    ctx.resetTransform();
    ctx.translate(this.center.x, this.center.y);

    // draw concentric circles
    [...new Array(Eye.NUM_PUPILS).keys()].forEach((i) => {
      const logFactor = Math.log(i + 2) / Math.log(Eye.NUM_PUPILS + 1);
      arc(ctx, pupilX, pupilY, r * logFactor, 0, Math.PI * 2);
    });

    arc(ctx, pupilX, pupilY, r * 0.1, 0, 2 * Math.PI);
    ctx.restore();
  }

  protected drawContour(ctx: CanvasRenderingContext2D) {
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
