import { recordOptions, listenerHandler, eventWithTime, EventType, event, IncrementalSource } from './types';
import { polyfill, getWindowWidth, getWindowHeight, mirror, on } from './utils';
import snapshot from '../snapshot/snapshot';
import initObservers from './observer';

function wrapEvent(e: event): eventWithTime {
  return {
    ...e,
    timestamp: Date.now(),
  };
}

let wrappedEmit!: (e: eventWithTime, isCheckout?: boolean) => void;

function record(options: recordOptions = {}): listenerHandler | undefined {
  const {
    emit,
    checkoutEveryNms,
    checkoutEveryNth,
    blockClass = 'art-block',
    ignoreClass = 'art-ignore',
    inlineStylesheet = true,
    maskAllInputs = false,
    hooks
  } = options;

  // runtime checks for user options
  if (!emit) {
    throw new Error('emit function is required');
  }

  polyfill();

  let lastFullSnapshotEvent: eventWithTime;
  let incrementalSnapshotCount = 0;

  wrappedEmit = (event: eventWithTime, isCheckout?: boolean) => {
    emit(event, isCheckout);
    if (event.type === EventType.FullSnapshot) {
      lastFullSnapshotEvent = event;
      incrementalSnapshotCount = 0;
    } else if (event.type === EventType.IncrementalSnapshot) {
      incrementalSnapshotCount++;
      const exceedCount =
        checkoutEveryNth && incrementalSnapshotCount >= checkoutEveryNth;
      const exceedTime =
        checkoutEveryNms &&
        event.timestamp - lastFullSnapshotEvent.timestamp > checkoutEveryNms;
      if (exceedCount || exceedTime) {
        takeFullSnapshot(true);
      }
    }
  };

  function takeFullSnapshot(isCheckout = false) {
    wrappedEmit(
      wrapEvent({
        type: EventType.Meta,
        data: {
          href: window.location.href,
          width: getWindowWidth(),
          height: getWindowHeight()
        }
      }),
      isCheckout
    );

    const [node, idNodeMap] = snapshot(
      document,
      blockClass,
      inlineStylesheet,
      maskAllInputs,
    );

    console.log('snapshot node: ', JSON.stringify(node));
    console.log('idNodeMap: ', idNodeMap);

    if (!node) {
      return console.warn('Failed to snapshot the document');
    }

    mirror.map = idNodeMap;
    wrappedEmit(
      wrapEvent({
        type: EventType.FullSnapshot,
        data: {
          node,
          initialOffset: {
            left: document.documentElement!.scrollLeft,
            top: document.documentElement!.scrollTop,
          }
        }
      })
    )
  }

  try {
    const handlers: listenerHandler[] = [];
    handlers.push(
      on('DOMContentLoaded', () => {
        wrappedEmit(
          wrapEvent({
            type: EventType.DomContentLoaded,
            data: {}
          })
        )
      })
    );

    const init = () => {
      takeFullSnapshot();

      handlers.push(
        initObservers(
          {
            mutationCb: m =>
              wrappedEmit(
                wrapEvent({
                  type: EventType.IncrementalSnapshot,
                  data: {
                    source: IncrementalSource.Mutation,
                    ...m,
                  },
                }),
              ),
            mousemoveCb: (positions, source) =>
              wrappedEmit(
                wrapEvent({
                  type: EventType.IncrementalSnapshot,
                  data: {
                    source,
                    positions,
                  },
                }),
              ),
            mouseInteractionCb: d =>
              wrappedEmit(
                wrapEvent({
                  type: EventType.IncrementalSnapshot,
                  data: {
                    source: IncrementalSource.MouseInteraction,
                    ...d,
                  },
                }),
              ),
            scrollCb: p =>
              wrappedEmit(
                wrapEvent({
                  type: EventType.IncrementalSnapshot,
                  data: {
                    source: IncrementalSource.Scroll,
                    ...p,
                  },
                }),
              ),
            viewportResizeCb: d =>
              wrappedEmit(
                wrapEvent({
                  type: EventType.IncrementalSnapshot,
                  data: {
                    source: IncrementalSource.ViewportResize,
                    ...d,
                  },
                }),
              ),
            inputCb: v =>
              wrappedEmit(
                wrapEvent({
                  type: EventType.IncrementalSnapshot,
                  data: {
                    source: IncrementalSource.Input,
                    ...v,
                  },
                }),
              ),
            blockClass,
            ignoreClass,
            maskAllInputs,
            inlineStylesheet,
          },
          hooks
        )
      );
    };

    if (
      document.readyState === 'interactive' ||
      document.readyState === 'complete'
    ) {
      init();
    } else {
      handlers.push(
        on('load', () => {
          wrappedEmit(
            wrapEvent({
              type: EventType.Load,
              data: {},
            }),
          );
          init();
        }, window)
      );
    }
    return () => {
      // handlers.forEach(handler => handler());
    };
  } catch (error) {
    console.warn(error);
  }
}

record.addCustomEvent = <T>(tag: string, payload: T) => {
  if (!wrappedEmit) {
    throw new Error('please add custom event after start recording');
  }
  wrappedEmit(
    wrapEvent({
      type: EventType.Custom,
      data: {
        tag,
        payload,
      },
    }),
  );
};

export default record;