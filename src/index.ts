import './constants/TRACKID';

import './interceptor';
import './mutation-observer';
import './events';
// import './performance';
// import './utils/idb';
import './data-store/intervalClear';

import './error-tracking/errorListener';

import snapshot from './snapshot/snapshot';
import rebuild from './snapshot/rebuild';

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded');
  const [node, idNodeMap] = snapshot(document);
  
  console.log('node: ', node);
  console.log('idNodeMap: ', idNodeMap);
  
  const wrapper = document.createElement('div');
  wrapper.classList.add('replayer-wrapper');
  const body = document.querySelector('body');
  if (body) {
    body.appendChild(wrapper);
  }
  
  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-same-origin');
  iframe.setAttribute('scrolling', 'yes');
  iframe.setAttribute('style', 'pointer-events: none');
  iframe.setAttribute('width', '375');
  iframe.setAttribute('height', '667');
  wrapper.appendChild(iframe);
  
  const [ rebuildNode, nodeMap ] = rebuild(node!, iframe.contentDocument!);
  
  console.log('rebuildNode: ', rebuildNode);
  console.log('nodeMap: ', nodeMap);
});
