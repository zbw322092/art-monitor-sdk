let supportsConstructableEventTarget: boolean;

try {
  // tslint:disable-next-line: no-unused-expression
  new EventTarget();

  supportsConstructableEventTarget = true;
} catch (err) {
  supportsConstructableEventTarget = false;
}

export { supportsConstructableEventTarget };