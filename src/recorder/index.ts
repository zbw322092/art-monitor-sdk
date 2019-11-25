import snapshot from '../snapshot/snapshot';
import { initMutationObserver } from '../mutation-observer';
import { nodeMirror } from '../utils/nodeMirror';

window.addEventListener('DOMContentLoaded', () => {
  const [node, idNodeMap] = snapshot(document);
  
  console.log('node: ', JSON.stringify(node));
  console.log('idNodeMap: ', idNodeMap);

  nodeMirror.map = idNodeMap;

  initMutationObserver();


  
});