import { Eye, EyeFollowConfig, EssentialEyeProps } from './Eye';

type ImageEyeConfig = EssentialEyeProps & Pick<ImageEye, 'cornea' | 'pupil'>;

export class ImageEye extends Eye {
  cornea: HTMLImageElement;
  pupil: HTMLImageElement;

  constructor({ cornea: corneaImage, pupil: pupilImage, ...rest }: ImageEyeConfig) {
    super({
      ...rest,
      width: corneaImage.width,
      height: corneaImage.height,
    });

    this.cornea = corneaImage;
    this.pupil = pupilImage;
  }

  updateBlink() {
    console.log('TODO: implement blink update logic for ImageEye');
  }

  protected drawContour(ctx: CanvasRenderingContext2D) {
    if (this.cornea.complete) {
      ctx.drawImage(this.cornea, -this.width / 2, -this.height / 2, this.width, this.height);
    }
  }

  protected drawPupil(ctx: CanvasRenderingContext2D, followConfig: EyeFollowConfig) {
    const { x: pupilX, y: pupilY } = this.calculatePupilPosition(followConfig);
    const { width: pupilWidth, height: pupilHeight } = this.pupil;

    ctx.resetTransform();
    ctx.translate(this.center.x - pupilWidth / 2, this.center.y - pupilHeight / 2);
    ctx.drawImage(this.pupil, -pupilX, pupilY, pupilWidth, pupilHeight);
  }
}
