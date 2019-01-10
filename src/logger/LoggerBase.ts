export default abstract class LoggerBase {
  constructor () {
    this.timestamp = performance.now();
    this.trackId = (window as any).TRACKID;
  }

  private timestamp: number;
  private trackId: string;
}