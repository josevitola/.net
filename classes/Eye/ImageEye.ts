import { ControlledImage } from '../ControlledImage';
import { Eye, EyeFollowConfig, EssentialEyeProps } from './Eye';

type ImageEyeConfig = EssentialEyeProps & Pick<ImageEye, 'cornea' | 'pupil'>;

export class ImageEye extends Eye {
  cornea: ControlledImage;
  pupil: ControlledImage;

  constructor({ cornea, pupil, ...rest }: ImageEyeConfig) {
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
    const { x: pupilX, y: pupilY } = this.calculatePupilPosition(followConfig);
    const { width: pupilWidth, height: pupilHeight } = this.pupil;

    ctx.resetTransform();
    ctx.translate(this.center.x - pupilWidth / 2, this.center.y - pupilHeight / 2);
    ctx.drawImage(this.pupil.img, pupilX, pupilY, pupilWidth, pupilHeight);
  }
}
