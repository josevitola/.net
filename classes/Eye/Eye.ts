import { Point } from '../Point';
import { scale } from '@/utils/math';
import { Box } from '../Box';

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

enum LidDirections {
  UP = 'UP',
  DOWN = 'DOWN',
}

type EyelidConfig = {
  dir: LidDirections;
};

export abstract class Eye extends Box {
  pupilRadius: number;
  blinking: BlinkingModes;
  private _framesSinceShake: number = -1;

  static readonly BLINK_SPEED = 2;
  static readonly DEFAULT_ABSTRACT_CONFIG: Required<EyeProps> = {
    ...Box.DEFAULT_PROPS,
    pupilRadius: 0,
  };
  static readonly DEFAULT_EYELID_CONFIG: EyelidConfig = {
    dir: LidDirections.UP,
  };

  constructor(config: Partial<EyeProps>) {
    const { center, pupilRadius, width, height, inclination } = {
      ...Eye.DEFAULT_ABSTRACT_CONFIG,
      ...config,
    };

    super({ center, width, height, inclination });
    this.pupilRadius = pupilRadius;
    this.blinking = BlinkingModes.IDLE;
  }

  update(ctx: CanvasRenderingContext2D, followConfig?: EyeFollowConfig) {
    this.draw(ctx, followConfig);
    this.updateActions();
  }

  private draw(ctx: CanvasRenderingContext2D, followConfig?: EyeFollowConfig) {
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

  private updateActions() {
    this.updateShaking();
  }

  updateShaking() {
    if (this._framesSinceShake >= 0 && this._framesSinceShake < 20) {
      this.shake();
    } else if (this._framesSinceShake >= 20) {
      this.endShaking();
    }
  }

  setupContext(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(this.inclination);
  }

  startBlinking() {
    const { IDLE, OPENING } = BlinkingModes;
    if (this.blinking === IDLE) this.blinking = OPENING;
  }

  protected calcPupilPositionToEyeCenter(followConfig: EyeFollowConfig) {
    const { x, y } = followConfig.follow ?? new Point();
    const cx = this.center.x;
    const cy = this.center.y;
    const dx = x - cx;
    const dy = y - cy;

    const mappedX = dx > 0
      ? cx + scale(dx, [0, followConfig.windowWidth], [0, this.width / 2])
      : cx + scale(dx, [0, -followConfig.windowWidth], [0, -this.width / 2]);

    const mappedY = dy > 0
      ? cy + scale(dy, [0, followConfig.windowHeight], [0, this.height / 2])
      : cy + scale(dy, [0, -followConfig.windowHeight], [0, -this.height / 2]);

    return { x: mappedX, y: mappedY };
  }

  shake() {
    const randomAngle = (Math.random() - 0.5) * 0.2;
    this.inclination += randomAngle;
    this._framesSinceShake++;
  }

  startShaking() {
    this._framesSinceShake = 0;
  }

  endShaking() {
    this._framesSinceShake = -1;
  }
}
