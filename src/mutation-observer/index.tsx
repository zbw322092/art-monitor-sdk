import unique from '../utils/unique-selector';
import idb from '../idb';

const targetNode = document.querySelector('body');

const isNodeNotElement = (node: Node | Element) => {
  return node instanceof Node && !(node instanceof Element);
};

const getNodeInfo = (node: Node) => {
  if (isNodeNotElement(node)) {
    if (node.parentElement) {
      return unique(node.parentElement) + ', nodeValue: ' + node.nodeValue;
    } else { return ''; }
  }

  return unique(node as Element);
};

const handleNode = (node: NodeList | Node) => {
  if (node instanceof Node) {
    return getNodeInfo(node);
  }
  return Array.prototype.map.call(node, (n: Node | Element) => {
    return getNodeInfo(n);
  });
};

let styleAttrMutationTimeout;
const consoleMutation = (mutationRecord: MutationRecord) => {
  const target = handleNode(mutationRecord.target);
  const addedNodes = handleNode(mutationRecord.addedNodes);
  const removedNodes = handleNode(mutationRecord.removedNodes);

  const nextSibling = mutationRecord.nextSibling ? handleNode(mutationRecord.nextSibling) : null;
  const previousSibling = mutationRecord.previousSibling ? handleNode(mutationRecord.previousSibling) : null;
  console.log(
    'timestamp: ' + performance.now() + ', ' +
    'type: ' + mutationRecord.type + ', ' +
    'target: ' + target + ', ' +
    'addedNode: ' + JSON.stringify(addedNodes) + ', ' +
    'removedNodes: ' + JSON.stringify(removedNodes) + ', ' +
    'attributeName: ' + mutationRecord.attributeName + ', ' +
    'attributeNamespace: ' + mutationRecord.attributeNamespace + ', ' +
    'previousSibling: ' + previousSibling + ', ' +
    'nextSibling: ' + nextSibling + ', ' +
    'oldValue: ' + mutationRecord.oldValue + ', '
  );
  if (mutationRecord.type === 'attributes' && mutationRecord.attributeName === 'style') {
    styleAttrMutationTimeout = window.setTimeout(() => {
      window.clearTimeout(styleAttrMutationTimeout);
      styleAttrMutationTimeout = null;
    }, 1000);
  }
};

const callback: MutationCallback = (mutations: MutationRecord[]) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' &&
      mutation.attributeName === 'style' &&
      styleAttrMutationTimeout
    ) { return; }
    consoleMutation(mutation);
  });
};
const config: MutationObserverInit = {
  attributes: true,
  attributeOldValue: true,
  childList: true,
  characterData: true,
  characterDataOldValue: true,
  subtree: true
};

const mutationObserver = new MutationObserver(callback);

if (targetNode) {
  mutationObserver.observe(targetNode, config);
}

idb.open('kv', 1)
  .then((db) => {
    console.log('db: ', db);
  });