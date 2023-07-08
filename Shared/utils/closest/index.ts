export default function closest(element, value) {
  if (element === null) {
    return null;
  }

  function conditionFn(currentElement) {
    if (!currentElement) {
      return currentElement;
    } else if (typeof value === 'string') {
      return Element.prototype.matches.call(currentElement, value);
    } else if (value instanceof NodeList || value instanceof Array) {
      return Array.from(value).includes(currentElement);
    } else if (value instanceof HTMLElement) {
      return value === currentElement;
    } else if (typeof value === 'function') {
      return value(currentElement);
    }

    return null;
  }

  let current = element;

  do {
    current =
      current.correspondingUseElement ||
      current.correspondingElement ||
      current;

    if (conditionFn(current)) {
      return current;
    }

    current = current.parentNode;
  } while (current && current !== document.body && current !== document);

  return null;
}
