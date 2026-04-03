import { Point } from './Point';

export type BasicEyeConfig = Pick<Eye, 'center' | 'id' | 'pupilRadius'>;

type AbstractEyeConfig = BasicEyeConfig & Pick<Eye, 'width' | 'height'>;

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

export abstract class Eye {
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
      ...Eye.DEFAULT_CONFIG,
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
    ctx.font = `${Eye.INFO_FONT_SIZE}px Arial`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(
      this.id,
      this.lowerCenter.x,
      this.lowerCenter.y + Eye.INFO_FONT_SIZE + Eye.EXTERNAL_MARGIN * 1.5,
    );
  }

  protected get upperCenter() {
    return this.center.addY(-this.pupilRadius);
  }

  protected get lowerCenter() {
    return this.center.addY(this.pupilRadius);
  }
}
