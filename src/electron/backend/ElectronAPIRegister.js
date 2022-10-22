
const { ipcMain: IPC, dialog } = require('electron');

//#region API-Endpoints

function onAskForClosing(evt, text, textDetail, yesBtnText, noBtnText){
    // Shows the dialog
    var res = dialog.showMessageBoxSync(null, {
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

function onShowErrorMessage(evt,title, text){
    dialog.showErrorBox(title, text);
}

//#endregion

// Registers all nodejs/electron-api-endpoints
function init(){
    IPC.on("askForClosing", onAskForClosing);
    IPC.on("showErrorMessage", onShowErrorMessage);
}

module.exports = { init }