import { Point } from '../Point';
import { toNewRange } from '@/utils/math';
import { Box } from '../Box';
import { TimeAction } from '../TimeAction';

export type EssentialEyeProps = Pick<Eye, 'center' | 'pupilRadius' | 'inclination'>;

export type EyeProps = EssentialEyeProps & Pick<Eye, 'width' | 'height'>;

export type MouseInfo = {
  position: Point;
  windowWidth: number;
  windowHeight: number;
};

type UpdateProps = {
  mouseInfo: MouseInfo;
  debug?: boolean;
}

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
  private shakeAction: TimeAction;
  private actions: TimeAction[];

  static readonly DEFAULT_SHAKE_DURATION = 20;
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
    this.shakeAction = new TimeAction(() => this.shake());
    this.actions = [this.shakeAction];
  }

  addAction(action: TimeAction) {
    this.actions.push(action);
  }

  update(ctx: CanvasRenderingContext2D, { mouseInfo, debug }: UpdateProps) {
    this.draw(ctx, mouseInfo);
    if (debug) {
      this.drawDebug(ctx, mouseInfo.position);
    }
    this.updateActions();
  }

  drawDebug(ctx: CanvasRenderingContext2D, mousePos: Point) {
    let isHovered = this.isHovered(ctx, mousePos);

    if (isHovered) {
      this.updateCursor(ctx, mousePos);
      this.drawBoxes(ctx, mousePos);
    }

    this.drawInfo(ctx);
  }

  private draw(ctx: CanvasRenderingContext2D, mouseInfo: MouseInfo) {
    ctx.save();
    this.setupContext(ctx);
    this.drawContour(ctx);
    this.drawPupil(ctx, mouseInfo);
    ctx.restore();
  }

  abstract updateBlink(): void;
  protected abstract drawPupil(ctx: CanvasRenderingContext2D, followConfig: MouseInfo): void;
  protected abstract drawContour(ctx: CanvasRenderingContext2D): void;

  private updateActions() {
    this.actions.forEach(action => action.update());
  }

  setupContext(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(this.inclination);
  }

  startBlinking() {
    const { IDLE, OPENING } = BlinkingModes;
    if (this.blinking === IDLE) this.blinking = OPENING;
  }

  protected calcPupilPositionToEyeCenter(followConfig: MouseInfo) {
    const { x, y } = followConfig.position ?? new Point();
    const cx = this.center.x;
    const cy = this.center.y;
    const dx = x - cx;
    const dy = y - cy;

    const mappedX = dx > 0
      ? cx + toNewRange(dx, [0, followConfig.windowWidth], [0, this.width / 2])
      : cx + toNewRange(dx, [0, -followConfig.windowWidth], [0, -this.width / 2]);

    const mappedY = dy > 0
      ? cy + toNewRange(dy, [0, followConfig.windowHeight], [0, this.height / 2])
      : cy + toNewRange(dy, [0, -followConfig.windowHeight], [0, -this.height / 2]);

    return { x: mappedX, y: mappedY };
  }

  shake() {
    const randomAngle = (Math.random() - 0.5) * 0.2;
    this.inclination += randomAngle;
  }

  startShaking(durationInFrames: number = Eye.DEFAULT_SHAKE_DURATION) {
    this.shakeAction.start(durationInFrames);
  }
}
