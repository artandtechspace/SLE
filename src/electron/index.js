const { app, BrowserWindow } = require('electron');
const path = require("path");

app.on('ready', () => {

  // Creates the browser-window
  const win = new BrowserWindow({
    width: 600*2,
    height: 400*2,
    icon: __dirname+"/../resources/icon/icon.png",
    webPreferences:{
      
    }
  });

  const indexHTML = path.join(__dirname + '/../index.html');
  win.loadFile(indexHTML);
});