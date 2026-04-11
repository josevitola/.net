import { toNewRange, toNextOdd } from '@/utils/math';
import { ControlledImage } from '../ControlledImage';
import { TimeAction } from '../TimeAction';
import { Eye, MouseInfo, EssentialEyeProps } from './Eye';

export type ImageEyeAssets = Pick<ImageEye, 'cornea' | 'pupil'>;

export class ImageEye extends Eye {
  cornea: ControlledImage;
  pupil: ControlledImage;
  private contractPupilAction: TimeAction;
  private expandPupilAction: TimeAction;
  private _origPupilWidth: number;

  static readonly DEFAULT_FOCUS_DURATION = Eye.DEFAULT_SHAKE_DURATION;

  constructor({
    cornea: origCornea,
    pupil: origPupil,
    ...rest
  }: ImageEyeAssets & Partial<EssentialEyeProps>) {
    const cornea = origCornea.copy();
    const pupil = origPupil.copy();
    const width = cornea.width ?? cornea.img.width;
    const height = (width / cornea.img.width) * cornea.img.height;

    super({ ...rest, width, height });

    this.cornea = cornea;
    this.pupil = pupil;
    this.contractPupilAction = new TimeAction((framesElapsed) => this.dispatchContractPupil(framesElapsed));
    this.expandPupilAction = new TimeAction((framesElapsed) => this.dispatchExpandPupil(framesElapsed));
    this._origPupilWidth = pupil.width ?? pupil.img.width;
    this.addAction(this.contractPupilAction);
    this.addAction(this.expandPupilAction);
  }

  updateBlink() { }

  protected drawContour(ctx: CanvasRenderingContext2D) {
    if (this.cornea.img.complete) {
      ctx.drawImage(this.cornea.img, -this.width / 2, -this.height / 2, this.width, this.height);
    }
  }

  protected drawPupil(ctx: CanvasRenderingContext2D, followConfig: MouseInfo) {
    const { x: pupilX, y: pupilY } = this.calcPupilPositionToEyeCenter(followConfig);
    const { width: pupilWidth, height: pupilHeight } = this.pupil;
    ctx.resetTransform();
    ctx.drawImage(this.pupil.img, pupilX - pupilWidth / 2, pupilY - pupilHeight / 2, pupilWidth, pupilHeight);
  }

  private dispatchContractPupil(framesElapsed: number) {
    const scaledX = toNewRange(framesElapsed, [0, this.contractPupilAction.duration], [0, Math.PI]);
    const imgScale = (Math.cos(scaledX) + 3) / 4;
    this.pupil.width = this._origPupilWidth * imgScale;
  }

  private dispatchExpandPupil(framesElapsed: number) {
    const scaledX = toNewRange(framesElapsed, [0, this.expandPupilAction.duration], [Math.PI, 2 * Math.PI]);
    const imgScale = (Math.cos(scaledX) + 3) / 4;
    this.pupil.width = this._origPupilWidth * imgScale;
  }

  contractPupil(durationInFrames: number = ImageEye.DEFAULT_FOCUS_DURATION) {
    this.contractPupilAction.start(durationInFrames);
  }

  expandPupil(durationInFrames: number = ImageEye.DEFAULT_FOCUS_DURATION) {
    this.expandPupilAction.start(durationInFrames);
  }
}
