import { supportsConstructableEventTarget } from './support';

/**
 * A minimal Event class shim.
 * This is used if the browser doesn't natively support constructable
 * EventTarget objects.
 */
class EventShim {
  constructor(type: string) {
    this.type = type;
  }
  public type: string;
}

export default supportsConstructableEventTarget ? Event : EventShim;