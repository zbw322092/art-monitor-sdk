import EventTarget from './shims/EventTarget';
import StateChangeEvent from './StateChangeEvent';
import { PageState } from './enums/PageState';
import { PageEvent } from './enums/PageEvent';

const ACTIVE = PageState.ACTIVE;
const PASSIVE = PageState.PASSIVE;
const HIDDEN = PageState.HIDDEN;
const FROZEN = PageState.FROZEN;
// const DISCARDED = PageState.DISCARDED; Not used but show to completeness.
const TERMINATED = PageState.TERMINATED;

// Detect Safari to work around Safari-specific bugs.
const safari = (window as any).safari;
const IS_SAFARI = typeof safari === 'object' && safari.pushNotification;

const SUPPORTS_PAGE_TRANSITION_EVENTS = 'onpageshow' in self;

const EVENTS = [
  PageEvent.focus,
  PageEvent.blur,
  PageEvent.visibilitychange,
  PageEvent.freeze,
  PageEvent.resume,
  PageEvent.pageshow,
  // IE9-10 do not support the pagehide event, so we fall back to unload
  // Note: unload *MUST ONLY* be added conditionally, otherwise it will
  // prevent page navigation caching (a.k.a bfcache).
  SUPPORTS_PAGE_TRANSITION_EVENTS ? PageEvent.pagehide : PageEvent.unload
];

const onbeforeunload = (event: Event) => {
  event.preventDefault();
  return event.returnValue = true;
};

/**
 * Converts an array of states into an object where the state is the key
 * and the value is the index.
 * @param arr {string[]} arr
 */
const toIndexedObject = (arr: string[]): { [key: string]: number } => {
  return arr.reduce((acc, curr, index) => {
    acc[curr] = index;
    return acc;
  }, {} as { [key: string]: number });
};

const LEGAL_STATE_TRANSITIONS = [
  // The normal unload process (bfcache process is addressed above).
  [ACTIVE, PASSIVE, HIDDEN, TERMINATED],

  // An active page transitioning to frozen,
  // or an unloading page going into the bfcache.
  [ACTIVE, PASSIVE, HIDDEN, FROZEN],

  // A hidden page transitioning back to active.
  [HIDDEN, PASSIVE, ACTIVE],

  // A frozen page being resumed
  [FROZEN, HIDDEN],

  // A frozen (bfcached) page navigated back to
  // Note: [FROZEN, HIDDEN] can happen here, but it's already covered above.
  [FROZEN, ACTIVE],
  [FROZEN, PASSIVE]
].map(toIndexedObject);

/**
 * Accepts a current state and a future state and returns an array of legal
 * state transition paths. This is needed to normalize behavior across browsers
 * since some browsers do not fire events in certain cases and thus skip
 * states.
 * @param prevState string
 * @param currState string
 */
const getLegalStateTransitionPath = (prevState: string, currState: string) => {
  for (let i = 0, len = LEGAL_STATE_TRANSITIONS.length; i < len; ++i) {
    const order = LEGAL_STATE_TRANSITIONS[i];
    const prevIndex = order[prevState];
    const currIndex = order[currState];

    if (prevIndex >= 0 &&
      currIndex >= 0 &&
      currIndex > prevIndex) {
      // Differences greater than one should be reported
      // because it means a state was skipped.
      return Object.keys(order).slice(prevIndex, currIndex + 1);
    }
  }

  return [];
};

/**
 * Returns the current state based on the document's visibility and
 * in input focus states. Note this method is only used to determine
 * active vs passive vs hidden states, as other states require listening
 * for events.
 * @return {string}
 */
const getCurrentState = (): string => {
  if (document.visibilityState === HIDDEN) {
    return HIDDEN;
  }

  if (document.hasFocus()) {
    return ACTIVE;
  }

  return PASSIVE;
};

/**
 * Class definition for the exported, singleton lifecycle instance.
 */
class Lifecycle extends EventTarget {
  /**
   * Initializes state, state history, and adds event listeners to monitor
   * state changes.
   */
  constructor() {
    super();

    const state = getCurrentState();
    this.currState = state;
    this.unsavedChanges = [];

    EVENTS.forEach((event) => {
      return window.addEventListener(event, this.handleEvents, true);
    });

    // Safari does not reliably fire the `pagehide` or `visibilitychange`
    // events when closing a tab, so we have to use `beforeunload` with a
    // timeout to check whether the default action was prevented.
    // - https://bugs.webkit.org/show_bug.cgi?id=151610
    // - https://bugs.webkit.org/show_bug.cgi?id=151234
    // NOTE: we only add this to Safari because adding it to Firefox would
    // prevent the page from being eligible for bfcache.
    if (IS_SAFARI) {
      window.addEventListener('beforeunload', (event) => {
        this.safariBeforeUnloadTimeout = window.setTimeout(() => {
          if (!(event.defaultPrevented || event.returnValue)) {
            this.dispatchChangesIfNeeded(event, HIDDEN);
          }
        }, 0);
      });
    }
  }

  private currState: string;
  private unsavedChanges: Array<symbol | object>;
  private safariBeforeUnloadTimeout: number | undefined = undefined;

  get State() {
    return this.currState;
  }

  get pageWasDiscarded() {
    return (document as any).wasDiscarded || false;
  }

  /**
   * @param id A unique symbol or object identifying the
   * pending state. This ID is required when removing the state later.
   */
  public addUnsavedChanges(id: symbol | object) {
    if (!(this.unsavedChanges.indexOf(id) > -1)) {
      // If this is the first state being added,
      // also add a beforeunload listener.
      if (this.unsavedChanges.length === 0) {
        window.addEventListener('beforeunload', onbeforeunload);
      }
      this.unsavedChanges.push(id);
    }
  }

  public removeUnsavedChanges(id: symbol | object) {
    const idIndex = this.unsavedChanges.indexOf(id);

    if (idIndex > -1) {
      this.unsavedChanges.splice(idIndex, 1);

      // If there's no more pending state, remove the event listener.
      if (this.unsavedChanges.length === 0) {
        window.removeEventListener('beforeunload', onbeforeunload);
      }
    }
  }

  private dispatchChangesIfNeeded(originalEvent: Event, newState: string) {
    if (newState !== this.currState) {
      const prevState = this.currState;
      const path = getLegalStateTransitionPath(prevState, newState);

      for (let i = 0, len = path.length; i < len - 1; ++i) {
        // tslint:disable-next-line: no-shadowed-variable
        const prevState = path[i];
        // tslint:disable-next-line: no-shadowed-variable
        const newState = path[i + 1];

        this.currState = newState;
        this.dispatchEvent(
          new StateChangeEvent('statechange', {
            prevState,
            newState,
            originalEvent
          }) as any
        );
      }
    }
  }

  private handleEvents = (event: Event) => {
    if (IS_SAFARI) {
      window.clearTimeout(this.safariBeforeUnloadTimeout);
    }

    switch (event.type) {
      case 'pageshow':
      case 'resume':
        this.dispatchChangesIfNeeded(event, getCurrentState());
        break;
      case 'focus':
        this.dispatchChangesIfNeeded(event, ACTIVE);
        break;
      case 'blur':
        // The `blur` event can fire while the page is being unloaded, so we
        // only need to update the state if the current state is "active".
        if (this.currState === ACTIVE) {
          this.dispatchChangesIfNeeded(event, getCurrentState());
        }
        break;
      case 'pagehide':
      case 'unload':
        this.dispatchChangesIfNeeded(event, (event as PageTransitionEvent).persisted ? FROZEN : TERMINATED);
        break;
      case 'visibilitychange':
        // The document's `visibilityState` will change to hidden as the page
        // is being unloaded, but in such cases the lifecycle state shouldn't
        // change.
        if (this.currState !== FROZEN &&
          this.currState !== TERMINATED) {
          this.dispatchChangesIfNeeded(event, getCurrentState());
        }
        break;
      case 'freeze':
        this.dispatchChangesIfNeeded(event, FROZEN);
        break;
    }
  }
}

export default Lifecycle;