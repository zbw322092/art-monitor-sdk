/**
 * Get class names for an element
 * @param element
 */
export const getClasses = (element: Element): string | null => {
  if (!element.hasAttribute('class')) { return null; }

  try {
    // Element.classList support from IE 10
    const classList = Array.prototype.slice.call(element.classList);

    // return only the valid CSS selectors based on RegEx
    return classList.filter((item) => {
      return /^[a-z_-][a-z\d_-]*$/i.test(item);
    }).map((className) => {
      return `.${className}`;
    }).join('');
  } catch (err) {
    let classNames = element.getAttribute('class');
    classNames = (classNames as string).trim().replace(/\s+/g, ' ');

    return classNames.split(' ').map((className) => {
      return `.${className}`;
    }).join('');
  }
};