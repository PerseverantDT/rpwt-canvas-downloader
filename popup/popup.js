document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("downloadWhole").addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "download", chunk: null })
    })
})