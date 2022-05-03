const { app, BrowserWindow } = require('electron');
const path = require("path");

app.on('ready', () => {
  console.log('App is ready');

  const win = new BrowserWindow({
    width: 600*2,
    height: 400*2,
    webPreferences:{
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const indexHTML = path.join(__dirname + '/../index.html');
    win.loadFile(indexHTML).then(() => {
        // IMPLEMENT FANCY STUFF HERE
  });
});