import { IDBStore } from '../data-store/IDBStore';
import { LoggerMutation } from '../logger/LoggerMutation';
import { TRACKTYPE } from '../constants/TRACKTYPE';

const iDBStore = new IDBStore('qnn-mkt', 'mutations', 'id');

const targetNode = document.querySelector('body');

let styleAttrMutationTimeout;
const storeMutation = (mutationRecord: MutationRecord) => {
  const mutaionLog = new LoggerMutation(TRACKTYPE.MUTATION, mutationRecord);

  iDBStore.set(mutaionLog)
    .then(() => {
      console.log('record added');
    })
    .catch((err) => {
      console.log('idb err: ', err);
    });
  console.log(mutaionLog);

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
    storeMutation(mutation);
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