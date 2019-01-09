/**
 * Returns the selectors based on the position of the element relative to its siblings
 * @param {Element} element
 */
export const getNthChild = (element: Element): null | string => {
  let counter = 0;
  const { parentElement } = element;

  if (parentElement) {
    /**
     *  NodeList and HTMLCollection both interfaces are collections of DOM nodes.
     * They differ in the methods they provide and in the type of nodes they can
     * contain. While a NodeList can contain any node type, an HTMLCollection
     * is supposed to only contain Element nodes.
     *
     * The ParentNode property children is a read-only property that returns a live
     * HTMLCollection which contains all of the child elements of the node upon which
     * it was called.
     * https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/children
     */
    const { children } = parentElement;
    const len = children.length;

    for (let k = 0; k < len; k++) {
      const sibling = children[k];
      counter++;
      if (sibling === element) {
        return `:nth-child(${counter})`;
      }
    }
  }
  return null;
};