const browser = window['browser'] || chrome;

setInterval(function () {
    browser.tabs.getSelected(function (currentTab) {
        console.log(currentTab);
        if (currentTab.id >= 0) {
            browser.tabs.sendMessage(currentTab.id, "updateCurrentTab");
        }
    });
}, 5000);