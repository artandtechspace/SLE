const { app, BrowserWindow } = require('electron');
const path = require("path");

// Prevents the app from launching during installation
if(require("electron-squirrel-startup")) return app.quit();

app.on('ready', () => {

  // Creates the browser-window
  const win = new BrowserWindow({
    width: 600*2,
    height: 400*2,
    icon: path.resolve(__dirname, "/../resources/icon/icon.png"),
  });

  const indexHTML = path.join(__dirname + '/../index.html');
  win.loadFile(indexHTML);
});