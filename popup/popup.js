"use strict";

const defaultValues = {
    "top-left-x": -500,
    "top-left-y": -500,
    "bottom-right-x": 499,
    "bottom-right-y": 499
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("downloadWhole").addEventListener("click", (event) => {
        chrome.runtime.sendMessage({
            action: "download",
            part: "whole",
            scale: document.getElementById("scale").valueAsNumber
        });

        event.preventDefault();
    });
    document.getElementById("downloadFull").addEventListener("click", (event) => {
        chrome.runtime.sendMessage({
            action: "download",
            part: "full",
            scale: document.getElementById("scale").valueAsNumber
        });

        event.preventDefault();
    })
    for (let i = 0; i < 6; i++) {
        document.getElementById(`downloadChunk${i}`).addEventListener("click", (event) => {
            chrome.runtime.sendMessage({
                action: "download",
                part: "chunk",
                chunk: i,
                scale: document.getElementById("scale").valueAsNumber
            });

            event.preventDefault();
        });
    }
    document.getElementById("downloadRect").addEventListener("click", (event) => {
        let tlx = document.getElementById("top-left-x").valueAsNumber;
        let tly = document.getElementById("top-left-y").valueAsNumber;
        let brx = document.getElementById("bottom-right-x").valueAsNumber;
        let bry = document.getElementById("bottom-right-y").valueAsNumber;
        chrome.runtime.sendMessage({
            action: "download",
            part: "rect",
            tlx: tlx,
            tly: tly,
            brx: brx,
            bry: bry,
            scale: document.getElementById("scale").valueAsNumber
        });

        event.preventDefault();
    });

    /** @type HTMLCollectionOf<HTMLInputElement> */
    let persistentInputs = document.getElementsByClassName("persistent-input");
    for (let input of persistentInputs) {
        chrome.storage.local.get(input.id, (result) => {
            if (result[input.id] === undefined)  input.value = defaultValues[input.id];
            else input.value = result[input.id];
        });
    }
    for (let input of persistentInputs) {
        input.addEventListener("input", async (event) => {
            await chrome.storage.local.set({[input.id]: input.valueAsNumber})
        })
    }
})