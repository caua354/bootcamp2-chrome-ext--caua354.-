
chrome.runtime.onInstalled.addListener(() => {
  console.log('Service Worker instalado com sucesso.');
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "defineWord" && info.selectionText) {
    chrome.storage.local.set({ selectedWord: info.selectionText });
  }
});

chrome.contextMenus.create({
    id: "defineWord",
    title: "Definir \"%s\"",
    contexts: ["selection"]
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Service Worker iniciado (startup).');
});