const isChrome = !window['browser'] && !!chrome;
// Prefer the more standard `browser` before Chrome API
const browser = isChrome ? chrome : window['browser'];

const baseUrl = 'https://readableextension.app';
const characterMapResourceUri = '/character-map.json';

function sendMessageToCurrentTab(currentTabId, message) {
    if (currentTabId >= 0) {
        browser.tabs.sendMessage(currentTabId, message);
    }
}

function createActiveTabMessenger(message) {
    return {
        send: function () {
            if (isChrome) {
                browser.tabs.getSelected(function ({ id }) { sendMessageToCurrentTab(id, message); });
            } else {
                browser.tabs.query({ active: true }).then(function (currentTabs) { sendMessageToCurrentTab(currentTabs[0].id, message); })
            }
        }
    };
}

const domChangedOnActiveTabMessenger = createActiveTabMessenger("DOM_CHANGED_ON_ACTIVE_TAB");

browser.runtime.onMessage.addListener(function (message) {
    if (message === 'DOM_CHANGED') {
        domChangedOnActiveTabMessenger.send();
    }
});

let characterMap;

browser.runtime.onMessage.addListener(function (message) {
    if (message === 'NEED_CHARACTER_MAP') {
        if (characterMap) {
            createActiveTabMessenger({ type: "CHARACTER_MAP_READY", characterMap }).send();
        } else {
            fetch(`${baseUrl}${characterMapResourceUri}`)
                .then(response => response.json())
                .then(map => {
                    characterMap = map;
                    createActiveTabMessenger({ type: "CHARACTER_MAP_READY", characterMap }).send();
                });
        }
    }
});
