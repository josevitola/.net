export class TimeAction {
  private _framesElapsed: number = -1;
  private _duration: number;
  private _action: () => void

  constructor(action: () => void, durationInFrames: number) {
    this._action = action;
    this._duration = durationInFrames;
  }

  update() {
    if (this._framesElapsed < 0) return;
    if (this._framesElapsed < this._duration) {
      this._action();
      this._framesElapsed++;
    } else {
      this.end();
    }
  }

  start(durationInFrames: number) {
    this._framesElapsed = 0;
    this._duration = durationInFrames;
  }

  end() {
    this._framesElapsed = -1;
    this._duration = 0;
  }
}