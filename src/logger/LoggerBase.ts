export default abstract class LoggerBase {
  constructor(TrackType: string) {
    this.TrackType = TrackType;
  }

  public readonly timestamp: number = performance.now();
  public readonly trackId: string = (window as any).TRACKID;
  public readonly TrackType: string;

}