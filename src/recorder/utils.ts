import { blockClass, Mirror, removedNodeMutation, listenerHandler, throttleOptions, event, hookResetter } from './types';
import { INode } from 'src/snapshot/types';

export function isBlocked(node: Node | null, blockClass: blockClass): boolean {
  if (!node) { return false; }

  if (node.nodeType === node.ELEMENT_NODE) {
    let needBlock = false;
    if (typeof blockClass === 'string') {
      needBlock = (node as Element).classList.contains(blockClass);
    } else {
      (node as Element).classList.forEach(className => {
        if (blockClass.test(className)) {
          needBlock = true;
        }
      });
    }
    return needBlock || isBlocked(node.parentNode, blockClass);
  }
  return isBlocked(node.parentNode, blockClass);
}

export const mirror: Mirror = {
  map: {},
  getId(node: INode) {
    // if n is not a serialized INode, use -1 as its id.
    if (!node.__sn) {
      return -1;
    }
    return node.__sn.id
  },
  getNode(id) {
    return mirror.map[id] || null;
  },
  removeNodeFromMap(node: INode) {
    const id = node.__sn && node.__sn.id;
    delete mirror.map[id];
    if (node.childNodes) {
      node.childNodes.forEach((childNode) => {
        mirror.removeNodeFromMap((childNode as Node) as INode);
      });
    }
  },
  has(id) {
    return mirror.map.hasOwnProperty(id)
  }
};

export function deepDelete(addsSet: Set<Node>, n: Node) {
  addsSet.delete(n);
  n.childNodes.forEach(childN => deepDelete(addsSet, childN));
}

export function isAncestorRemoved(target: INode): boolean {
  const id = mirror.getId(target);
  if (!mirror.has(id)) {
    return true;
  }
  if (
    target.parentNode &&
    target.parentNode.nodeType === target.DOCUMENT_NODE
  ) {
    return false;
  }
  // if the root is not document, it means the node is not in the DOM tree anymore
  if (!target.parentNode) {
    return true;
  }
  return isAncestorRemoved((target.parentNode as unknown) as INode);
}

export function isParentRemoved(
  removes: removedNodeMutation[],
  n: Node,
): boolean {
  const { parentNode } = n;
  if (!parentNode) {
    return false;
  }
  const parentId = mirror.getId((parentNode as Node) as INode);
  if (removes.some(r => r.id === parentId)) {
    return true;
  }
  return isParentRemoved(removes, parentNode);
}

export function isAncestorInSet(set: Set<Node>, n: Node): boolean {
  const { parentNode } = n;
  if (!parentNode) {
    return false;
  }
  if (set.has(parentNode)) {
    return true;
  }
  return isAncestorInSet(set, parentNode);
}

export function on(
  type: string,
  fn: EventListenerOrEventListenerObject,
  target: Document | Window = document,
): listenerHandler {
  const options = { capture: true, passive: true };

  target.addEventListener(type, fn, options);
  return () => target.removeEventListener(type, fn, options);
}

export function throttle<T>(
  func: (arg: T) => void,
  wait: number,
  options: throttleOptions = {},
) {
  let timeout: number | null = null;
  let previous = 0;
  // tslint:disable-next-line: only-arrow-functions
  return function (arg: T) {
    let now = Date.now();
    if (!previous && options.leading === false) {
      previous = now;
    }
    let remaining = wait - (now - previous);
    let context = this;
    let args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        window.clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args as any);
    } else if (!timeout && options.trailing !== false) {
      timeout = window.setTimeout(() => {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        func.apply(context, args as any);
      }, remaining);
    }
  };
}

export function isTouchEvent(
  event: MouseEvent | TouchEvent
): event is TouchEvent {
  return Boolean((event as TouchEvent).changedTouches);
}

export function getWindowHeight(): number {
  return (
    window.innerHeight ||
    (document.documentElement && document.documentElement.clientHeight) ||
    (document.body && document.body.clientHeight)
  );
}

export function getWindowWidth(): number {
  return (
    window.innerWidth ||
    (document.documentElement && document.documentElement.clientWidth) ||
    (document.body && document.body.clientWidth)
  );
}

export function hookSetter<T>(
  target: T,
  key: string | number | symbol,
  d: PropertyDescriptor,
  isRevoked?: boolean,
): hookResetter {
  const original = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(
    target,
    key,
    isRevoked
      ? d
      : {
        set(value) {
          // put hooked setter into event loop to avoid of set latency
          setTimeout(() => {
            d.set!.call(this, value);
          }, 0);
          if (original && original.set) {
            original.set.call(this, value);
          }
        },
      },
  );
  return () => hookSetter(target, key, original || {}, true);
}

export function polyfill() {
  if ('NodeList' in window && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = (Array.prototype
      .forEach as unknown) as NodeList['forEach'];
  }
}
