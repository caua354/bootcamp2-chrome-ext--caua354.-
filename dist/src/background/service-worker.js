chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "defineWord",
        title: "Definir \"%s\"",
        contexts: ["selection"]
    });
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "defineWord" && info.selectionText) {
        chrome.storage.local.set({ selectedWord: info.selectionText });

        console.log(`Palavra "${info.selectionText}" salva para busca.`);
    }
});