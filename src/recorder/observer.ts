import {
  observerParam, hooksParam, listenerHandler, Arguments, mutationCallBack,
  mousemoveCallBack, mouseInteractionCallBack, scrollCallback, viewportResizeCallback,
  inputCallback, blockClass, textCursor, attributeCursor, removedNodeMutation,
  addedNodeMutation, mousePosition, IncrementalSource, MouseInteractions, inputValue, hookResetter
} from './types';
import { isBlocked, mirror, deepDelete, isAncestorRemoved, isAncestorInSet, isParentRemoved, throttle, isTouchEvent, on, getWindowHeight, getWindowWidth, hookSetter } from './utils';
import { INode } from '../snapshot/types';
import { serializeNodeWithId } from '../snapshot/serializeNodeWithId';

const moveKey = (id: number, parentId: number) => `${id}@${parentId}`;
function isINode(node: Node | INode): node is INode {
  return '__sn' in node;
}

function mergeHook(observerParam: observerParam, hooks: hooksParam) {
  const {
    mutationCb,
    mousemoveCb,
    mouseInteractionCb,
    scrollCb,
    viewportResizeCb,
    inputCb,
  } = observerParam;

  observerParam.mutationCb = (...p: Arguments<mutationCallBack>) => {
    if (hooks.mutation) {
      hooks.mutation(...p);
    }
    mutationCb(...p);
  };

  observerParam.mousemoveCb = (...p: Arguments<mousemoveCallBack>) => {
    if (hooks.mousemove) {
      hooks.mousemove(...p);
    }
    mousemoveCb(...p);
  };
  observerParam.mouseInteractionCb = (...p: Arguments<mouseInteractionCallBack>) => {
    if (hooks.mouseInteraction) {
      hooks.mouseInteraction(...p);
    }
    mouseInteractionCb(...p);
  };
  observerParam.scrollCb = (...p: Arguments<scrollCallback>) => {
    if (hooks.scroll) {
      hooks.scroll(...p);
    }
    scrollCb(...p);
  };
  observerParam.viewportResizeCb = (...p: Arguments<viewportResizeCallback>) => {
    if (hooks.viewportResize) {
      hooks.viewportResize(...p);
    }
    viewportResizeCb(...p);
  };
  observerParam.inputCb = (...p: Arguments<inputCallback>) => {
    if (hooks.input) {
      hooks.input(...p);
    }
    inputCb(...p);
  };
}

function initMutationObserver(
  cb: mutationCallBack,
  blockClass: blockClass,
  inlineStylesheet: boolean,
  maskAllInputs: boolean,
): MutationObserver {

  const observer = new MutationObserver((mutations) => {
    const texts: textCursor[] = [];
    const attributes: attributeCursor[] = [];
    let removes: removedNodeMutation[] = [];
    const adds: addedNodeMutation[] = [];

    const addedSet = new Set<Node>();
    const movedSet = new Set<Node>();
    const droppedSet = new Set<Node>();

    const movedMap: Record<string, true> = {};

    const genAdds = (node: Node | INode, target?: Node | INode) => {
      if (isBlocked(node, blockClass)) { return; }

      if (isINode(node)) {
        movedSet.add(node);
        let targetId: number | null = null;
        if (target && isINode(target)) {
          targetId = target.__sn.id;
        }
        if (targetId) {
          movedMap[moveKey(node.__sn.id, targetId)] = true;
        }
      } else {
        addedSet.add(node);
        droppedSet.delete(node);
      }
      node.childNodes.forEach((childNode) => genAdds(childNode));
    }

    mutations.forEach((mutation) => {
      const { type, target, oldValue, addedNodes, removedNodes, attributeName } = mutation;

      switch (type) {
        case 'characterData': {
          const value = target.textContent;
          if (!isBlocked(target, blockClass) && value !== oldValue) {
            texts.push({
              value,
              node: target
            });
          }
          break;
        }

        case 'attributes': {
          const value = (target as Element).getAttribute(attributeName!);
          if (isBlocked(target, blockClass) || value === oldValue) {
            return;
          }
          let item: attributeCursor | undefined = attributes.find((attribute) => {
            attribute.node === target;
          });
          if (!item) {
            item = {
              node: target,
              attributes: {}
            };

            attributes.push(item);
          }

          item.attributes[attributeName!] = value;
          break;
        }

        case 'childList': {
          addedNodes.forEach((addedNode) => {
            return genAdds(addedNode, target);
          });
          removedNodes.forEach((removedNode) => {
            const nodeId = mirror.getId(removedNode as INode);
            const parentId = mirror.getId(target as INode);
            if (isBlocked(removedNode, blockClass)) { return; }
            // removed node has not been serialized yet, just remove it from the Set
            if (addedSet.has(removedNode)) {
              deepDelete(addedSet, removedNode);
              droppedSet.add(removedNode);
            } else if (addedSet.has(target) && nodeId === -1) {
              /**
               * If target was newly added and removed child node was
               * not serialized, it means the child node has been removed
               * before callback fired, so we can ignore it because
               * newly added node will be serialized without child nodes.
               * TODO: verify this
               */
            } else if (isAncestorRemoved(target as INode)) {
              /**
               * If parent id was not in the mirror map any more, it
               * means the parent node has already been removed. So
               * the node is also removed which we do not need to track
               * and replay.
               */
            } else if (movedSet.has(removedNode) && movedMap[moveKey(nodeId, parentId)]) {
              deepDelete(movedSet, removedNode);
            } else {
              removes.push({
                parentId,
                id: nodeId
              });
            }

            mirror.removeNodeFromMap(removedNode as INode);
          });
          break;
        }
        default:
          break;
      }
    });

    /**
     * Sometimes child node may be pushed before its newly added
     * parent, so we init a queue to store these nodes.
     */
    const addQueue: Node[] = [];
    const pushAdd = (node: Node) => {
      const parentId = mirror.getId((node.parentNode as Node) as INode);
      if (parentId === -1) {
        return addQueue.push(node);
      }

      adds.push({
        parentId,
        previousId: node.previousSibling && mirror.getId(node.previousSibling as INode),
        nextId: node.nextSibling && mirror.getId((node.nextSibling as unknown) as INode),
        node: serializeNodeWithId(
          node,
          document,
          mirror.map,
          blockClass,
          true,
          inlineStylesheet,
          maskAllInputs
        )!
      });
    };

    Array.from(movedSet).forEach(pushAdd);

    Array.from(addedSet).forEach((addedNode) => {
      if (!isAncestorInSet(droppedSet, addedNode) && !isParentRemoved(removes, addedNode)) {
        pushAdd(addedNode);
      } else if (isAncestorInSet(movedSet, addedNode)) {
        pushAdd(addedNode);
      } else {
        droppedSet.add(addedNode);
      }
    });

    while (addQueue.length) {
      if (
        addQueue.every((node) => {
          return mirror.getId((node.parentNode as Node) as INode) === -1
        })
      ) {
        /**
         * If all nodes in queue could not find a serialized parent,
         * it may be a bug or corner case. We need to escape the
         * dead while loop at once.
         */
        break;
      }
      pushAdd(addQueue.shift()!);
    }

    const payload = {
      texts: texts.map((text) => {
        return {
          id: mirror.getId(text.node as INode),
          value: text.value
        }
      }).filter((text) => {
        return mirror.has(text.id)
      }),
      attributes: attributes.map((attribute) => {
        return {
          id: mirror.getId(attribute.node as INode),
          attributes: attribute.attributes
        };
      }).filter((attribute) => {
        return mirror.has(attribute.id);
      }),
      removes,
      adds
    };

    // payload may be empty if the mutations happened in some blocked elements
    if (
      !payload.texts.length &&
      !payload.attributes.length &&
      !payload.removes.length &&
      !payload.adds.length
    ) {
      return;
    }

    cb(payload);
  });

  observer.observe(document, {
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    characterDataOldValue: true,
    childList: true,
    subtree: true
  });
  return observer;
}

function initMoveObserver(cb: mousemoveCallBack): listenerHandler {
  let positions: mousePosition[] = [];
  let timeBaseline: number | null;

  const wrappedCb = throttle((isTouch: boolean) => {
    const totalOffset = Date.now() - timeBaseline!;
    cb(
      positions.map((position) => {
        position.timeOffset = position.timeOffset - totalOffset;
        return position;
      }),
      isTouch ? IncrementalSource.TouchMove : IncrementalSource.MouseMove
    );
    positions = [];
    timeBaseline = null;
  }, 500);

  const updatePosition = throttle<MouseEvent | TouchEvent>((event) => {
    const { target } = event;
    const { clientX, clientY } = isTouchEvent(event) ?
      event.changedTouches[0] :
      event;
    if (!timeBaseline) {
      timeBaseline = Date.now();
    }
    positions.push({
      x: clientX,
      y: clientY,
      id: mirror.getId(target as INode),
      timeOffset: Date.now() - timeBaseline
    });
    wrappedCb(isTouchEvent(event));
  }, 50, { trailing: false });

  const handlers = [
    // @ts-ignore
    on('mousemove', updatePosition),
    // @ts-ignore
    on('touchmove', updatePosition)
  ];

  return () => {
    handlers.forEach((handler) => {
      return handler();
    });
  };
}

function initMouseInteractionObserver(
  cb: mouseInteractionCallBack,
  blockClass: blockClass
): listenerHandler {
  const handlers: listenerHandler[] = [];
  const getHandler = (eventKey: keyof typeof MouseInteractions) => {
    return (event: MouseEvent | TouchEvent) => {
      if (isBlocked(event.target as Node, blockClass)) { return; }
      const id = mirror.getId(event.target as INode);
      const { clientX, clientY } = isTouchEvent(event)
        ? event.changedTouches[0]
        : event;
      cb({
        type: MouseInteractions[eventKey],
        id,
        x: clientX,
        y: clientY,
      });
    };
  };
  Object.keys(MouseInteractions)
    .filter((key) => {
      return Number.isNaN(Number(key)) && !key.endsWith('_Departed');
    })
    // @ts-ignore
    .forEach((eventKey: keyof typeof MouseInteractions) => {
      const eventName = eventKey.toLowerCase();
      const handler = getHandler(eventKey);
      // @ts-ignore
      handlers.push(on(eventName, handler));
    });
  return () => {
    handlers.forEach(handler => handler());
  };
}

function initScrollObserver(
  cb: scrollCallback,
  blockClass: blockClass,
): listenerHandler {
  const updatePosition = throttle<UIEvent>(evt => {
    if (!evt.target || isBlocked(evt.target as Node, blockClass)) {
      return;
    }
    const id = mirror.getId(evt.target as INode);
    if (evt.target === document) {
      const scrollEl = (document.scrollingElement || document.documentElement)!;
      cb({
        id,
        x: scrollEl.scrollLeft,
        y: scrollEl.scrollTop,
      });
    } else {
      cb({
        id,
        x: (evt.target as HTMLElement).scrollLeft,
        y: (evt.target as HTMLElement).scrollTop,
      });
    }
  }, 100);
  // @ts-ignore
  return on('scroll', updatePosition);
}

function initViewportResizeObserver(
  cb: viewportResizeCallback,
): listenerHandler {
  const updateDimension = throttle(() => {
    const height = getWindowHeight();
    const width = getWindowWidth();
    cb({
      width: Number(width),
      height: Number(height),
    });
  }, 200);
  return on('resize', updateDimension, window);
}

const INPUT_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];
const MASK_TYPES = [
  'color',
  'date',
  'datetime-local',
  'email',
  'month',
  'number',
  'range',
  'search',
  'tel',
  'text',
  'time',
  'url',
  'week',
];
const lastInputValueMap: WeakMap<EventTarget, inputValue> = new WeakMap();
function initInputObserver(
  cb: inputCallback,
  blockClass: blockClass,
  ignoreClass: string,
  maskAllInputs: boolean,
): listenerHandler {
  function eventHandler(event: Event) {
    const { target } = event;
    if (
      !target ||
      !(target as Element).tagName ||
      INPUT_TAGS.indexOf((target as Element).tagName) < 0 ||
      isBlocked(target as Node, blockClass)
    ) {
      return;
    }
    const type: string | undefined = (target as HTMLInputElement).type;
    if (
      type === 'password' ||
      (target as HTMLElement).classList.contains(ignoreClass)
    ) {
      return;
    }
    let text = (target as HTMLInputElement).value;
    let isChecked = false;
    const hasTextInput =
      MASK_TYPES.includes(type) || (target as Element).tagName === 'TEXTAREA';
    if (type === 'radio' || type === 'checkbox') {
      isChecked = (target as HTMLInputElement).checked;
    } else if (hasTextInput && maskAllInputs) {
      text = '*'.repeat(text.length);
    }
    cbWithDedup(target, { text, isChecked });
    // if a radio was checked
    // the other radios with the same name attribute will be unchecked.
    const name: string | undefined = (target as HTMLInputElement).name;
    if (type === 'radio' && name && isChecked) {
      document
        .querySelectorAll(`input[type="radio"][name="${name}"]`)
        .forEach(el => {
          if (el !== target) {
            cbWithDedup(el, {
              text: (el as HTMLInputElement).value,
              isChecked: !isChecked,
            });
          }
        });
    }
  }
  function cbWithDedup(target: EventTarget, v: inputValue) {
    const lastInputValue = lastInputValueMap.get(target);
    if (
      !lastInputValue ||
      lastInputValue.text !== v.text ||
      lastInputValue.isChecked !== v.isChecked
    ) {
      lastInputValueMap.set(target, v);
      const id = mirror.getId(target as INode);
      cb({
        ...v,
        id,
      });
    }
  }
  const handlers: Array<listenerHandler | hookResetter> = [
    'input',
    'change',
  ].map(eventName => on(eventName, eventHandler));
  const propertyDescriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  );
  const hookProperties: Array<[HTMLElement, string]> = [
    [HTMLInputElement.prototype, 'value'],
    [HTMLInputElement.prototype, 'checked'],
    [HTMLSelectElement.prototype, 'value'],
    [HTMLTextAreaElement.prototype, 'value'],
  ];
  if (propertyDescriptor && propertyDescriptor.set) {
    handlers.push(
      ...hookProperties.map(p =>
        hookSetter<HTMLElement>(p[0], p[1], {
          set() {
            // mock to a normal event
            eventHandler({ target: this } as Event);
          },
        }),
      ),
    );
  }
  return () => {
    handlers.forEach(h => h());
  };
}

export default function initObservers(
  observerParam: observerParam,
  hooks: hooksParam = {},
): listenerHandler {
  mergeHook(observerParam, hooks);

  const mutationObserver = initMutationObserver(
    observerParam.mutationCb,
    observerParam.blockClass,
    observerParam.inlineStylesheet,
    observerParam.maskAllInputs,
  );
  const mousemoveHandler = initMoveObserver(observerParam.mousemoveCb);
  const mouseInteractionHandler = initMouseInteractionObserver(
    observerParam.mouseInteractionCb,
    observerParam.blockClass,
  );
  const scrollHandler = initScrollObserver(observerParam.scrollCb, observerParam.blockClass);
  const viewportResizeHandler = initViewportResizeObserver(observerParam.viewportResizeCb);
  const inputHandler = initInputObserver(
    observerParam.inputCb,
    observerParam.blockClass,
    observerParam.ignoreClass,
    observerParam.maskAllInputs,
  );

  return () => {
    mutationObserver.disconnect();
    mousemoveHandler();
    mouseInteractionHandler();
    scrollHandler();
    viewportResizeHandler();
    inputHandler();
  };
}