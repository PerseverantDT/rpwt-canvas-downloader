"use strict";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("downloadWhole").addEventListener("click", (event) => {
        chrome.runtime.sendMessage({
            action: "download",
            part: "whole"
        });

        event.preventDefault();
    });
    document.getElementById("downloadFull").addEventListener("click", (event) => {
        chrome.runtime.sendMessage({
            action: "download",
            part: "full"
        });

        event.preventDefault();
    })
    for (let i = 0; i < 6; i++) {
        document.getElementById(`downloadChunk${i}`).addEventListener("click", (event) => {
            chrome.runtime.sendMessage({
                action: "download",
                part: "chunk",
                chunk: i
            });

            event.preventDefault();
        });
    }
    document.getElementById("downloadRect").addEventListener("click", (event) => {
        let tlx = parseInt(document.getElementById("top-left-x").value);
        let tly = parseInt(document.getElementById("top-left-y").value);
        let brx = parseInt(document.getElementById("bottom-right-x").value);
        let bry = parseInt(document.getElementById("bottom-right-y").value);
        chrome.runtime.sendMessage({
            action: "download",
            part: "rect",
            tlx: tlx,
            tly: tly,
            brx: brx,
            bry: bry
        });

        event.preventDefault();
    });
})