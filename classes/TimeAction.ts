export class TimeAction {
  duration: number = 0;
  isExecuting: boolean = false;
  private _framesElapsed: number = -1;
  private _action: (framesElapsed: number) => void;

  constructor(action: (framesElapsed: number) => void) {
    this._action = action;
  }

  update() {
    if (this._framesElapsed < 0) return;
    if (this._framesElapsed < this.duration) {
      this._action(this._framesElapsed);
      this._framesElapsed++;
    } else {
      this.stop();
    }
  }

  start(durationInFrames: number) {
    if (this.isExecuting) return;
    this._framesElapsed = 0;
    this.duration = durationInFrames;
    this.isExecuting = true;
  }

  stop() {
    this._framesElapsed = -1;
    this.duration = 0;
    this.isExecuting = false;
  }
}
