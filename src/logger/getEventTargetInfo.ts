import unique from '../utils/unique-selector/index';

export const getEventTargetInfo = (eventTarget: EventTarget | null): string | null => {
  if (eventTarget === null) {
    return null;
  } else if (eventTarget instanceof Element) {
    return unique(eventTarget);
  } else {
    return Object.prototype.toString.call(eventTarget);
  }
};