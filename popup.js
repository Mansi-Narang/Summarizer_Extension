document.getElementById("summary").addEventListener("click",()=>{
    const result = document.getElementById("content");
    const selectSummaryType = document.getElementById('select-options');

    result.innerHTML = "<div class='loader'></div>";

    chrome.storage.sync.get(['geminiKey'], ({geminiKey}) => {
        if(!geminiKey){
            result.textContent = "NO API KEY SET. Click the gear icon to set the API Key.";
            return;
        }
        
        chrome.tabs.query({active: true, currentWindow : true}, ([tab]) => {

            chrome.tabs.sendMessage(tab.id, {type : "GET_ARTICLE_TEXT"}, async({text} = {}) => {
                if(!text){
                    result.textContent = "Couldn't extract text from this page";
                    return;
                }
                
                try{
                    const summary = await getGeminiSummary(text, selectSummaryType.value, geminiKey);
                    result.textContent = summary;
                }catch(E){
                    result.textContent = "Gemini Error: " + E.message;
                }
            })
        })
    })

    })

    async function getGeminiSummary(rawtext, type, apiKey) {
        const max = 20000;
        const text = rawtext.length > max ? rawtext.slice(0,max) + "..." : rawtext;
        const promptMap = {
            brief : `Summarize in 2-3 sentences: \n\n${text}`,
            detailed : `Give a detailed summary: \n\n${text}`,
            bullets : `Summarize in bullet points start each line with '->': \n\n ${text}`
        }

        const prompt = promptMap[type] || promptMap.brief;   

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers : {
                    "Content-Type" : "application/json"
                }, 
                body : JSON.stringify({
                    contents : [{
                        parts : [{text: prompt}]
                    }]
                })
            }
        );

        if(!res.ok){
            const {error} = await res.json();
            throw new Error(error?.message || "Request failed");
        }

        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "NO SUMMARY";
    }

    const copy = document.getElementById('copy').addEventListener('click', async() => {
        const data = document.getElementById("content").innerText;
        if(!data)return;
        await navigator.clipboard.writeText(data).then(() => {
            const btn = document.getElementById("copy");
            const old = btn.textContent;
            btn.textContent = 'Copied';
            setTimeout(()=>{
                btn.textContent = old
            }, 2000);
        });
    })