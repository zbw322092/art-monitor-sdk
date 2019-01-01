const ACTIVE = 'active';
const PASSIVE = 'passive';
const HIDDEN = 'hidden';
const FROZEN = 'frozen';
// const DISCARDED = 'discarded'; Not used but show to completeness.
const TERMINATED = 'terminated';

const safari = (window as any).safari;
const IS_SAFARI = typeof safari === 'object' && safari.pushNotification;

const SUPPORTS_PAGE_TRANSITION_EVENTS = 'onpageshow' in self;

const EVENTS = [
  'focus',
  'blur',
  'visibilitychange',
  'freeze',
  'resume',
  'pageshow',
  // IE9-10 do not support the pagehide event, so we fall back to unload
  // Note: unload *MUST ONLY* be added conditionally, otherwise it will
  // prevent page navigation caching (a.k.a bfcache).
  SUPPORTS_PAGE_TRANSITION_EVENTS ? 'pagehide' : 'unload'
];

// TODO
const onbeforunload = (event: Event) => {
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
  for (let i = 0; ; ++i) {
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
