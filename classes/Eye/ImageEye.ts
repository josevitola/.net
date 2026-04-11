import { scale, toNextOdd } from '@/utils/math';
import { ControlledImage } from '../ControlledImage';
import { TimeAction } from '../TimeAction';
import { Eye, MouseInfo, EssentialEyeProps } from './Eye';

export type ImageEyeAssets = Pick<ImageEye, 'cornea' | 'pupil'>;

export class ImageEye extends Eye {
  cornea: ControlledImage;
  pupil: ControlledImage;
  private focusAction: TimeAction;
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
    this.focusAction = new TimeAction((framesElapsed) => this.focus(framesElapsed));
    this._origPupilWidth = pupil.width ?? pupil.img.width;
    this.addAction(this.focusAction);
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

  focus(framesElapsed: number) {
    const scaledX = scale(framesElapsed, [0, this.focusAction.duration], [0, 2 * Math.PI]);
    const imgScale = (Math.cos(scaledX) + 3) / 4;
    console.log({ framesElapsed, scaledX: scaledX.toFixed(2), imgScale: imgScale.toFixed(2) });
    this.pupil.width = this._origPupilWidth * imgScale;
  }

  startFocus(durationInFrames: number = ImageEye.DEFAULT_FOCUS_DURATION) {
    this.focusAction.start(toNextOdd(durationInFrames));
  }
}
