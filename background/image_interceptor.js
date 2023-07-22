let canvas = new OffscreenCanvas(3000, 2000);
let ctx = canvas.getContext("2d");
ctx.fillStyle = "white";
ctx.fillRect(0, 0, 3000, 2000);

const chunkOffset = [
    {x: 0, y: 0},
    {x: 1000, y: 0},
    {x: 2000, y: 0},
    {x: 0, y: 1000},
    {x: 1000, y: 1000},
    {x: 2000, y: 1000}
]

chrome.webRequest.onBeforeRequest.addListener(
    async function (details) {
        "use strict";
        if (details.type !== "image") return;

        try {
            const response = await fetch(details.url);
            if (!response.ok) await chrome.tabs.sendMessage(details.tabId, {
                action: "error",
                name: response.status,
                message: response.statusText,
                source: "background/image_interceptor.js"
            });
            else {
                let blob = await response.blob()
                const parts = /https:\/\/garlic-bread\.reddit\.com\/media\/canvas-images\/.+\/(.)\/.+/.exec(details.url);
                const chunk = parts[1];

                let imageData = await createImageBitmap(blob);
                ctx.drawImage(imageData, chunkOffset[chunk].x, chunkOffset[chunk].y);
            }
        } catch (error) {
            await chrome.tabs.sendMessage(details.tabId, {
                action: "error",
                name: error.name,
                message: error.message,
                source: "background/image_interceptor.js"
            });
        }

        return {cancel: false};
    },
    {
        urls: ["https://garlic-bread.reddit.com/media/canvas-images/*/*"],
        types: ["image"]
    },
    []
);

chrome.runtime.onMessage.addListener(async function (msg) {
    if (msg.action === "download") {
        let tlx, tly, brx, bry, scale;
        switch (msg.part) {
            case "full":
                [tlx, tly, brx, bry] = [0, 0, 3000, 2000];
                break;
            case "whole":
                [tlx, tly, brx, bry] = [1000, 500, 2500, 1500];
                break;
            case "chunk":
                [tlx, tly, brx, bry] = [
                    chunkOffset[msg.chunk].x,
                    chunkOffset[msg.chunk].y,
                    chunkOffset[msg.chunk].x + 1000,
                    chunkOffset[msg.chunk].y + 1000,
                ];
                break;
            case "rect":
                [tlx, tly, brx, bry] = [
                    msg.tlx + 1500,
                    msg.tly + 1000,
                    msg.brx + 1500,
                    msg.bry + 1000
                ]
                break;
        }
        scale = msg.scale;

        let bufferCanvas = new OffscreenCanvas(brx - tlx, bry - tly);
        let bufferCtx = bufferCanvas.getContext("2d");
        bufferCtx.drawImage(canvas, -tlx, -tly);

        let outputCanvas = new OffscreenCanvas((brx - tlx) * scale, (bry - tly) * scale);
        let outputCtx = outputCanvas.getContext("2d");
        outputCtx.imageSmoothingEnabled = false;
        outputCtx.drawImage(bufferCanvas, 0, 0, brx - tlx, bry - tly, 0, 0, (brx - tlx) * scale, (bry - tly) * scale);

        saveImageData(await outputCanvas.convertToBlob({type: "image/png"}));
    }
});

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
