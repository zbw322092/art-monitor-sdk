export default abstract class LoggerBase {
  constructor(trackType: string) {
    this.trackType = trackType;
  }

  public readonly timestamp: number = performance.now();
  public readonly trackId: string = (window as any).TRACKID;
  public readonly trackType: string;

}