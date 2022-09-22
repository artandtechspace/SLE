const { app, BrowserWindow, ipcMain: IPC, dialog } = require('electron');
const path = require("path");

// Will hold the window
var win;

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

// Handles install, updates and other stuff on squirrel-windows application
function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
};

// Creates the main window
function createWindow(){
  // Creates the browser-window
  win = new BrowserWindow({
    width: 600*2,
    height: 400*2,
    icon: path.resolve(__dirname, "/../resources/icon/icon.png"),
    webPreferences: {
      preload: path.resolve(__dirname,"preload.js")
    }
  });

  const indexHTML = path.join(__dirname + '/../index.html');
  win.loadFile(indexHTML);
}

// Registers the listeners for nodejs-accesses from the browser-window
function registerElectronAPIEndpoints(){
  IPC.on("askForClosing",(evt, text, textDetail, yesBtnText, noBtnText)=>{
    
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
      win.close();
  });

  IPC.on("showErrorMessage", (evt,title, text)=>{
    dialog.showErrorBox(title, text);
  });
}

app.whenReady().then(()=>{

  registerElectronAPIEndpoints();

  createWindow(); 

});