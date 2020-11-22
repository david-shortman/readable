const replaceOnActiveTab = (replacements, keys, { target = document.body } = {}) => {
  [
    target,
    ...target.querySelectorAll("*:not(script):not(noscript):not(style)")
  ].forEach(({ childNodes: [...nodes] }) => nodes
    .filter(({ nodeType }) => nodeType === document.TEXT_NODE)
    .forEach((textNode) => {
      const oldContent = textNode.textContent.slice();
      let newContent = '';
      [...oldContent].forEach((oldCharacter, i) => {
        const replacement = replacements[oldCharacter];
        if (replacement) {
          newContent += replacement;
        } else {
          newContent += oldCharacter;
        }
      });
      textNode.textContent = newContent;
    }));
};

let characterMap;

const browser = window['browser'] || chrome;

function updatePage() {
  replaceOnActiveTab(characterMap, Object.keys(characterMap));
}

browser.runtime.onMessage.addListener(function (message) {
  if (message === 'updateCurrentTab') {
    if (characterMap) {
      replaceOnActiveTab(characterMap, Object.keys(characterMap));
    } else {
      fetch('https://raw.githubusercontent.com/david-shortman/readable/main/alphabets/character-map.json').then(data => data.json()).then(res => {
        characterMap = res;
        replaceOnActiveTab(characterMap, Object.keys(characterMap));
      });
    }
  }
});
