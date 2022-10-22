
/**
 * IMPORTANT: THIS FILE IS PRELOADED FOR THE BROWSER-WINOW AND CAN ACCESS NODE-JS FUNCTIONS.
 * KEEP IT AS SIMPLE AS POSSIBLE
 */


const { contextBridge: CB, ipcRenderer: IPC } = require('electron');

/**
 * This file will be preloaded for the browser-window and can access nodejs-functions
 */


const askForClosing = (text, textDetail, yesBtnText, noBtnText)=>{
    return IPC.sendSync("askForClosing",text, textDetail, yesBtnText, noBtnText);
};

const showErrorMessage = (title, text) => {
    IPC.send("showErrorMessage", title, text);
}

// Exposes all these functions using an electronAPI-Global object
CB.exposeInMainWorld("electronAPI", {
    askForClosing,
    showErrorMessage
});
