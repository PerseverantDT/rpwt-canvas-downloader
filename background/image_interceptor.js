let canvas = new OffscreenCanvas(1000, 1000);
let ctx = canvas.getContext("2d");

const chunkOffset = {
    "1": { x: 0, y: -500 },
    "4": { x: 0, y: 500 }
}

chrome.webRequest.onBeforeRequest.addListener(
    async function (details) {
        "use strict";
        if (details.type !== "image") return;

        try {
            const response = await fetch(details.url);
            if (!response.ok) chrome.tabs.sendMessage(details.tabId, { action: "error", error: error, source: "background/image_interceptor.js" });
            else {
                let blob = await response.blob()
                const parts = /https:\/\/garlic-bread\.reddit\.com\/media\/canvas-images\/(?:.+)\/(.)\/(?:.+)/.exec(details.url);
                const chunk = parts[1];

                let imageData = await createImageBitmap(blob);
                ctx.drawImage(imageData, chunkOffset[chunk].x, chunkOffset[chunk].y);
            }
        } catch (error) {
            chrome.tabs.sendMessage(details.tabId, { action: "error", name: error.name , message: error.message, source: "background/image_interceptor.js" });
        }

        return { cancel: false }
    },
    {
        urls: ["https://garlic-bread.reddit.com/media/canvas-images/*/*"],
        types: ["image"]
    },
    []
)

chrome.runtime.onMessage.addListener(async function (msg, sender, sendResponse) {
    if (msg.action === "download") {
        if (msg.chunk === null) {
            saveImageData(await canvas.convertToBlob({ type: "image/png" }));
        }
    }
})

function saveImageData(imageData) {
    "use strict";
    const reader = new FileReader();
    reader.onloadend = function () {
        const dataUrl = reader.result;
        chrome.downloads.download({
            url: dataUrl,
            filename: "rpwt.png",
            saveAs: true
        });
    };

    reader.readAsDataURL(imageData);
}
