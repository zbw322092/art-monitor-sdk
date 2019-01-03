import { isElement } from './isElement';

export const getParents = (element: Element): Element[] => {
  const parents: Element[] = [];
  let currentElement = element;
  while (isElement(currentElement)) {
    parents.push(currentElement);
    currentElement = currentElement.parentElement as Element;
  }

  return parents;
};