import snapshot from '../snapshot/snapshot';
import { initMutationObserver } from '../mutation-observer';
import { nodeMirror } from '../state/nodeMirror';
import { initResizeListener } from '../events/Event/resize';
import { initScrollListener } from 'src/events/Event/scroll';
import { initMouseListener } from 'src/events/MouseEvent/mouseEvent';
import { pageSize } from '../state/pageSize';
import { pageScroll } from '../state/pageScroll';
import { initSelectionListener } from '../events/Event/selection';
import { initInputListener } from '../events/UIEvent/input';
import { initStateChangeListener } from 'src/events/CustomEvent/statechangeEvent';

window.addEventListener('DOMContentLoaded', () => {
  const [node, idNodeMap] = snapshot(document);

  console.log('node: ', JSON.stringify(node));
  console.log('idNodeMap: ', idNodeMap);

  nodeMirror.map = idNodeMap;

  pageSize.setPageSize(
    (document.defaultView as Window).innerWidth,
    (document.defaultView as Window).innerHeight
  );

  pageScroll.setPageScroll(window.scrollX, window.scrollY);

  initMutationObserver();
  initResizeListener();
  initScrollListener();
  initMouseListener();
  initSelectionListener();
  initInputListener();
  initStateChangeListener();


  
});