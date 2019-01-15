import { LoggerMutation } from '../logger/LoggerMutation';
import { TRACKTYPE } from '../constants/TRACKTYPE';
import { iDBStoreInstance } from '../data-store/IDBStore';
import { OBJECTNAME } from '../constants/DB';

const targetNode = document.querySelector('body');

let styleAttrMutationTimeout: number | null;
const storeMutation = (mutationRecord: MutationRecord) => {
  const mutaionLog = new LoggerMutation(TRACKTYPE.MUTATION, mutationRecord);
  console.log('mutaion log', mutaionLog);

  iDBStoreInstance.set(OBJECTNAME, mutaionLog)
    .then(() => {
      console.log('mutaion log added');
    })
    .catch((err) => {
      console.log('mutaion log err: ', err);
    });

  if (mutationRecord.type === 'attributes' && mutationRecord.attributeName === 'style') {
    styleAttrMutationTimeout = window.setTimeout(() => {
      window.clearTimeout(styleAttrMutationTimeout as number);
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