export default abstract class LoggerBase {
  constructor(TrackType: number) {
    this.TrackType = TrackType;
  }

  public readonly timestamp: number = performance.now();
  public readonly trackId: string = (window as any).TRACKID;
  public readonly TrackType: number;
  public readonly width: number;
  public readonly height: number;
}