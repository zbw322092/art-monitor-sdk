import unique from '../utils/unique-selector';
import { IDBStore } from '../data-store/IDBStore';
import { LoggerMutation } from '../logger/LoggerMutation';

const iDBStore = new IDBStore('qnn-mkt', 'mutations', 'id');

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
  return JSON.stringify(
    Array.prototype.map.call(node, (n: Node | Element) => {
      return getNodeInfo(n);
    })
  );
};

let styleAttrMutationTimeout;
const consoleMutation = (mutationRecord: MutationRecord) => {
  const { type, target, addedNodes, removedNodes, attributeName, attributeNamespace,
    nextSibling, previousSibling, oldValue } = mutationRecord;
  const targetSelector = handleNode(target);
  const addedNodesSelector = handleNode(addedNodes);
  const removedNodesSelector = handleNode(removedNodes);

  const nextSiblingSelector = nextSibling ? handleNode(nextSibling) : null;
  const previousSiblingSelector = previousSibling ? handleNode(previousSibling) : null;

  const mutaionLog = new LoggerMutation(
    type, targetSelector, addedNodesSelector, removedNodesSelector, attributeName,
    attributeNamespace, previousSiblingSelector, nextSiblingSelector, oldValue
  );

  iDBStore.set(mutaionLog)
    .then(() => {
      console.log('record added');
    })
    .catch((err) => {
      console.log('idb err: ', err);
    });
  console.log(mutaionLog);

  if (type === 'attributes' && attributeName === 'style') {
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