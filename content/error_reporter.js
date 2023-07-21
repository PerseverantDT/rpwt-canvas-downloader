chrome.runtime.onMessage.addListener(async function (msg, sender, sendResponse) {
    if (msg.action === "error") {
        console.error(`Error occurred in ${msg.source} => ${msg.name}: ${msg.message}`);
    }
});
