import { ControlledImage } from '../ControlledImage';
import { Eye, EyeFollowConfig, EssentialEyeProps } from './Eye';

export type ImageEyeAssets = Pick<ImageEye, 'cornea' | 'pupil'>;

export class ImageEye extends Eye {
  cornea: ControlledImage;
  pupil: ControlledImage;

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
  }

  updateBlink() {
    console.log('TODO: implement blink update logic for ImageEye');
  }

  protected drawContour(ctx: CanvasRenderingContext2D) {
    if (this.cornea.img.complete) {
      ctx.drawImage(this.cornea.img, -this.width / 2, -this.height / 2, this.width, this.height);
    }
  }

  protected drawPupil(ctx: CanvasRenderingContext2D, followConfig: EyeFollowConfig) {
    const { x: pupilX, y: pupilY } = this.calcPupilPositionToEyeCenter(followConfig);
    const { width: pupilWidth, height: pupilHeight } = this.pupil;

    ctx.resetTransform();
    ctx.drawImage(this.pupil.img, pupilX - pupilWidth / 2, pupilY - pupilHeight / 2, pupilWidth, pupilHeight);
  }
}
