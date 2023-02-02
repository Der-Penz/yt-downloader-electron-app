const { app, BrowserWindow } = require('electron');
const path = require('path');
if (require('electron-squirrel-startup')) {
	app.quit();
}

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 900,
		height: 650,
		resizable: false,
		movable: true,
		center: true,
		closable: true,
		frame: false,
		autoHideMenuBar: true,
		hasShadow: false,
		icon:  path.join(__dirname, 'icon.ico'),
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
		},
	});

	require('@electron/remote/main').initialize();
	require('@electron/remote/main').enable(mainWindow.webContents);

	mainWindow.loadFile(path.join(__dirname, 'index.html'));

	// mainWindow.webContents.openDevTools();

	mainWindow.webContents.on('new-window', function (e, url) {
		e.preventDefault();
		require('electron').shell.openExternal(url);
	});
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
