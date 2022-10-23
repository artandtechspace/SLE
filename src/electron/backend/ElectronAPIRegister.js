
const { ipcMain: IPC, dialog } = require('electron');
const fs = require("fs");
const path = require("path");

//#region API-Endpoints

/**
 * Creates a native popup to ask the user if he wants to close the application
 * 
 * @param {string} text 
 * @param {string} textDetail 
 * @param {string} yesBtnText 
 * @param {string} noBtnText 
 */
function onAskForClosing(evt, text, textDetail, yesBtnText, noBtnText){
    // Shows the dialog
    var res = dialog.showMessageBoxSync(global.win, {
        type: 'question',
        buttons: [yesBtnText, noBtnText],
        defaultId: 1,
        message: text,
        detail: textDetail,
        noLink: true
    });

    // Returns true/false if the user clicked yes
    evt.returnValue = res === 0;

    // Sends another close-request if the used wants to close the application
    if(res === 0)
        // References the window defined inside the main file
        global.win.close();
}

/**
 * Shows a native popup with an error-message
 * 
 * @param {string} title 
 * @param {string} text 
 */
function onShowErrorMessage(evt,title, text){
    dialog.showErrorBox(title, text);
}

/**
 * Shows a native open file dialog
 * 
 * @param {string} title 
 * @param {string} buttonLabel open button lable
 * @param {electron/FileFilter[]} filters filters for which files can be loaded
 * @returns 
 */
function onShowOpenFileDialog(evt, title, buttonLabel, filters){
    var res = dialog.showOpenDialogSync(global.win, {
        properties: ['openFile'],
        title,
        buttonLabel,
        filters
    });

    // Ensures a single select
    if(res === undefined){
        evt.returnValue = undefined;
        return;
    }

    if(res.length === 1){
        evt.returnValue = res[0];
        return;
    }

    evt.returnValue = undefined;
}

/**
 * Reads in a given project-file and
 * @returns the raw-project json string as a string or undefined if the file failed to be read
 * 
 * @param {string} path
 */
function onReadInProjectFile(evt, selectedPath){
    try{
        // Reads in the file using utf-8
        evt.returnValue = fs.readFileSync(selectedPath, {encoding:'utf8', flag:'r'});
    }catch(e){
        evt.returnValue = undefined;
    }
}

/**
 * Shows a native save file dialog
 * 
 * @param {string} title 
 * @param {string} buttonLabel save button lable
 * @param {electron/FileFilter[]} filters filters for what files can be saved as
 */
function onShowSaveFileDialog(evt, title, buttonLabel, filters, defaultPath){
    evt.returnValue = dialog.showSaveDialogSync(global.win, {
        title,
        buttonLabel,
        filters,
        properties: ["showOverwriteConfirmation"],
        defaultPath
    });
}

/**
 * Writes the given data into the given file/path
 * 
 * @param {string} path to write the data to (Must not exist, as it will be created) 
 * @param {string} data the raw data to write
 */
function onSaveFile(evt, selectedPath, data){
    try{
        var base = path.dirname(selectedPath);
    
        // Ensures the parent directory exists
        fs.mkdirSync(base,{
            recursive: true
        });

        fs.writeFileSync(selectedPath, data);
        evt.returnValue = true;
    }catch(e){
        evt.returnValue = e;
    }
}

//#endregion

// Registers all nodejs/electron-api-endpoints
function init(){
    IPC.on("askForClosing", onAskForClosing);
    IPC.on("showErrorMessage", onShowErrorMessage);
    IPC.on("showOpenFileDialog", onShowOpenFileDialog);
    IPC.on("readInProjectFile", onReadInProjectFile);
    IPC.on("showSaveFileDialog", onShowSaveFileDialog);
    IPC.on("saveFile", onSaveFile);
}

module.exports = { init }