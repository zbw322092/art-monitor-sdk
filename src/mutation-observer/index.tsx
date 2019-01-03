import unique from '../utils/unique-selector';

const targetNode = document.querySelector('body');
const tipsTitle = document.querySelector('head > meta:nth-child(5)');

console.log('tipsTitle: ', tipsTitle);
if (tipsTitle) {
  const selector = unique(tipsTitle);
  console.log('tipsTitle selector: ', selector);
  const elem = document.querySelectorAll(selector);
  if (elem.length === 1 && elem[0] === tipsTitle) {
    console.log('it is unique!');
  } else {
    console.log('wrong');
  }
}

const callback: MutationCallback = (mutations) => {
  console.log('mutations: ', mutations);
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
  targetNode.addEventListener('click', (event) => {
    console.log(event);
  });
  window.addEventListener('scroll', (event) => {
    console.log(event);
  });
  mutationObserver.observe(targetNode, config);
}