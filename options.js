document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(['geminiKey'], ({geminiKey}) => {
        if(geminiKey) document.getElementById("api-key").value = geminiKey;
    })

    document.getElementById("save").addEventListener("click", () => {
        const apiKey = document.getElementById("api-key").value.trim();
        if(!apiKey)return;
        chrome.storage.sync.set({geminiKey : apiKey}, () =>{
            document.getElementById("success").style.display = "block";
            setTimeout(() => window.close(), 5000);
        })
    });
})