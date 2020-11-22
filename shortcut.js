const baseUrl = 'https://readableextension.app';
const characterMapResourceUri = '/character-map.json';

/** Replaces non-standard characters with appropriate replacement. */
function makeTextNodesOnDocumentReadable(replacements, { target = document.body } = {}) {
  [
    target,
    ...target.querySelectorAll("*:not(script):not(noscript):not(style)")
  ].forEach(({ childNodes: [...nodes] }) => nodes
    // Ignore non-text nodes, and ignore text nodes that have been marked as already being replaced by the Readable extension
    .filter(({ nodeType, rdblExtHasReplaced }) => nodeType === document.TEXT_NODE && !rdblExtHasReplaced)
    .forEach((textNode) => {
      const oldContent = textNode.textContent.slice();
      let newContent = '';
      // Spread operator correctly puts unicode characters into individual entries in array
      [...oldContent].forEach(oldCharacter => {
        const replacement = replacements[oldCharacter];
        if (replacement) {
          newContent += replacement;
        } else {
          newContent += oldCharacter;
        }
      });
      textNode.textContent = newContent;
      // Mark node as replaced
      textNode['rdblExtHasReplaced'] = true;
    }));
    completion(); // notify Safari that Shortcut has finished execution
}

let characterMap;

function loadCharacterMapThenMakeReadable() {
    fetch(`${baseUrl}${characterMapResourceUri}`)
                .then(response => response.json())
                .then(map => {
                    characterMap = map;
                    makeTextNodesOnDocumentReadable(characterMap);
                    });
}

function makeDocumentReadable() {
  if (characterMap) {
    makeTextNodesOnDocumentReadable(characterMap);
  } else {
    loadCharacterMapThenMakeReadable();
  }
}

// Initialize page once
makeDocumentReadable();
