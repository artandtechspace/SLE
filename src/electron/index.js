const { app, BrowserWindow } = require('electron');
const path = require("path");

app.on('ready', () => {
  console.log('App is ready');

  const win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences:{
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const indexHTML = path.join(__dirname + '/resources/index.html');
    win.loadFile(indexHTML).then(() => {
        // IMPLEMENT FANCY STUFF HERE
  });
});