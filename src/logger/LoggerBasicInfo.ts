export class LoggerBasicInfo {
  public trackId: string = (window as any).TRACKID;
  public location = {
    href: window.location.href,
    host: window.location.host,
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    origin: window.location.origin,
    port: window.location.port,
    pathname: window.location.pathname,
    hash: window.location.hash,
    search: window.location.search
  };
}