import { Eye, EyeFollowConfig, EssentialEyeProps } from './Eye';

type ImageEyeConfig = EssentialEyeProps & Pick<ImageEye, 'corneaImage' | 'pupilImage'>;

export class ImageEye extends Eye {
  corneaImage: HTMLImageElement;
  pupilImage: HTMLImageElement;

  constructor({ corneaImage, pupilImage, ...rest }: ImageEyeConfig) {
    super({
      ...rest,
      width: corneaImage.width,
      height: corneaImage.height,
    });

    this.corneaImage = corneaImage;
    this.pupilImage = pupilImage;
  }

  updateBlink() {
    console.log('TODO: implement blink update logic for ImageEye');
  }

  protected drawContour(ctx: CanvasRenderingContext2D) {
    if (this.corneaImage.complete) {
      ctx.drawImage(this.corneaImage, -this.width / 2, -this.height / 2, this.width, this.height);
    }
  }

  protected drawPupil(ctx: CanvasRenderingContext2D, followConfig: EyeFollowConfig) {
    const { x: pupilX, y: pupilY } = this.calculatePupilPosition(followConfig);
    const { width: pupilWidth, height: pupilHeight } = this.pupilImage;

    ctx.resetTransform();
    ctx.translate(this.center.x - pupilWidth / 2, this.center.y - pupilHeight / 2);
    ctx.drawImage(this.pupilImage, -pupilX, pupilY, pupilWidth, pupilHeight);
  }
}
