const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { scrapeTwitch } = require('./scraper');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');

    // Escuchar el evento de inicio de scraping
    ipcMain.on('start-scraping', () => {
        scrapeTwitch(win); // Pasar la ventana para enviar datos
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});