
/**
 * IMPORTANT: THIS FILE IS PRELOADED FOR THE BROWSER-WINOW AND CAN ACCESS NODE-JS FUNCTIONS.
 * KEEP IT AS SIMPLE AS POSSIBLE
 */

const { contextBridge: CB, ipcRenderer: IPC } = require('electron');



const askForClosing = (text, textDetail, yesBtnText, noBtnText) => IPC.sendSync("askForClosing",text, textDetail, yesBtnText, noBtnText);

const showErrorMessage = (title, text) => IPC.send("showErrorMessage", title, text);

const showOpenFileDialog = (title, buttonLabel, filters) => IPC.sendSync("showOpenFileDialog", title, buttonLabel, filters);

const readInProjectFile = (path) => IPC.sendSync("readInProjectFile", path);

const showSaveFileDialog = (title, buttonLabel, filters, defaultPath) => IPC.sendSync("showSaveFileDialog", title, buttonLabel, filters, defaultPath);

const saveFile = (path, data) => IPC.sendSync("saveFile", path, data);

const openURL = (url) => IPC.send("openURL", url);

const openDevTools = ()=> IPC.send("openDevTools");

const closeWindow = ()=> IPC.send("closeWindow");

// Exposes all these functions using an electronAPI-Global object
CB.exposeInMainWorld("electronAPI", {
    askForClosing,
    showErrorMessage,
    showOpenFileDialog,
    readInProjectFile,
    showSaveFileDialog,
    saveFile,
    openURL,
    openDevTools,
    closeWindow
});
