const { contextBridge: CB, ipcRenderer: IPC } = require('electron');

/**
 * This file will be preloaded for the browser-window and can access nodejs-functions
 */


const askForClosing = (text, textDetail, yesBtnText, noBtnText)=>{
    const MSG = "askForClosing";

    return IPC.sendSync(MSG,text, textDetail, yesBtnText, noBtnText);
};

// Exposes all these functions using an electronAPI-Global object
CB.exposeInMainWorld("electronAPI", {
    askForClosing
});
