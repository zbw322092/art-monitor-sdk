import { getParents } from './getParents';
import { getTag } from './getTag';
import { getNthChild } from './getNthChild';
import { getAttributes } from './getAttributes';
import { getClasses } from './getClasses';
import { getID } from './getID';
import { isUnique } from './isUnique';

interface IOptions {
  attributesToIgnore?: string[];
  excludeRegex?: null | RegExp;
}

const getUniqueSelector = (
  element: Element,
  attributesToIgnore: string[]
): string | null => {
  const id = getID(element);
  if (id) {
    return id;
  }
  const classes = getClasses(element);
  if (classes && isUnique(element, classes)) {
    return classes;
  }
  const attrs = getAttributes(element, attributesToIgnore);
  if (attrs && isUnique(element, attrs)) {
    return attrs;
  }

  if (classes && attrs && isUnique(element, classes + attrs)) {
    return classes + attrs;
  }

  const tag = getTag(element);
  if (isUnique(element, tag)) {
    return tag;
  }

  if (classes && attrs && isUnique(element, classes + attrs + ' ' + tag)) {
    return classes + attrs + ' ' + tag;
  }

  return null;
};

const unique = (element: Element, options: IOptions = {}): string => {
  const {
    attributesToIgnore = ['id', 'class', 'length']
  } = options;

  const parents = getParents(element);
  let uniqueSelector = '';
  let firstUniqueElem;
  let firstUniqueElemIndex = -1;
  for (const elem of parents) {
    const selector = getUniqueSelector(elem, attributesToIgnore);
    firstUniqueElemIndex++;
    if (selector) {
      firstUniqueElem = elem;
      uniqueSelector = selector;
      break;
    }
  }

  if (firstUniqueElem === element) {
    return uniqueSelector;
  }

  const elementPath = parents.slice(0, firstUniqueElemIndex);
  elementPath.forEach((elem) => {
    uniqueSelector = uniqueSelector + ' ' + getTag(elem) + getNthChild(elem);
  });
  return uniqueSelector;
};

export default unique;