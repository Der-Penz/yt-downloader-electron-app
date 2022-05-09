const { dialog, app} = require('@electron/remote');
const fs = require('fs');

export async function choosePath() {
	const { filePaths } = await dialog.showOpenDialog({
		defaultPath: getStoragePath(),
		properties: ['openDirectory'],
		title: 'Select folder to store files.',
	});

	if (filePaths.length < 1) return null;

	const path = filePaths[0] || localStorage.getItem('download-path') || app.getPath('downloads');
	localStorage.setItem('download-path', path);
	return path;
}

export function getStoragePath() {
	return (
		localStorage.getItem('download-path') || app.getPath('downloads')
	);
}

export function doesFileExist(filePath, title, extension) {
	return fs.existsSync(`${filePath}/${title}.${extension}`);
}