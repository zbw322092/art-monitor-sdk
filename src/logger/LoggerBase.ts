export default abstract class LoggerBase {

  public readonly timestamp: number = performance.now();
  public readonly trackId: string = (window as any).TRACKID;

}