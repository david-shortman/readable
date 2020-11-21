/** Adapted from https://stackoverflow.com/a/41886794/11087018 */
const replaceOnDocument = (replacements, keys, { target = document.body } = {}) => {
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

function updatePage(event) {
  replaceOnDocument(characterMap);
}

fetch('https://raw.githubusercontent.com/david-shortman/readable/main/alphabets/character-map.json').then(data => data.json()).then(res => {
  characterMap = res;
  replaceOnDocument(characterMap, Object.keys(characterMap));

  // TODO: update the page when page text content has changed
  setInterval(updatePage, 5000);
});
