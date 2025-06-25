chrome.runtime.onInstalled.addListener(() => {
        chrome.storage.sync.get(["geminiKey"], (result) => {
            if(!result.geminiKey){
                chrome.tabs.create({ url : "options.html"})
            }
        })
})