import { supportsConstructableEventTarget } from './support';

class EventTargetShim {
  constructor() {
    this.registry = {};
  }
  private registry: { [key: string]: any };

  /**
   * @see https://dom.spec.whatwg.org/#dom-eventtarget-addeventlistener
   */
  public addEventListener(type: string, listener: EventListener): void {
    this.getRegistry(type).push(listener);
  }

  /**
   * @see https://dom.spec.whatwg.org/#dom-eventtarget-removeeventlistener
   */
  public removeEventListener(type: string, listener: EventListener): void {
    const typeRegistery = this.getRegistry(type);
    const handlerIndex = typeRegistery.indexOf(listener);
    if (handlerIndex > -1) {
      typeRegistery.splice(handlerIndex, 1);
    }
  }

  public dispatchEvent(event: Event) {
    // Set the target then freeze the event object to prevent modification.
    (event as any).target = this;
    Object.freeze(event);

    this.getRegistry(event.type).forEach((listener) => {
      return listener(event);
    });
    return true;
  }

  /**
   * Returns an array of handlers associated with the passed event type.
   * If no handlers have been registered, an empty array is returned.
   * @private
   */
  private getRegistry(type: string): EventListener[] {
    return this.registry[type] || [];
  }
}

export default supportsConstructableEventTarget ? EventTarget : EventTargetShim;