const { dialog } = require('@electron/remote');
const fs = require('fs');

export async function choosePath() {
	const { filePaths } = await dialog.showOpenDialog({
		defaultPath: getStoragePath(),
		properties: ['openDirectory'],
		title: 'Select folder to store files.',
	});

	if (filePaths.length < 0) return null;

	const path = filePaths[0];
	localStorage.setItem('download-path', path);
	return path;
}

export function getStoragePath() {
	return (
		localStorage.getItem('download-path') || remote.app.getPath('downloads')
	);
}

export function doesFileExist(filePath, title, extension) {
	return fs.existsSync(`${filePath}/${title}.${extension}`);
}