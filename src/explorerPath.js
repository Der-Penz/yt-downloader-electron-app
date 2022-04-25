const remote = require('@electron/remote');
const { dialog } = remote;

async function choosePath() {
	const { filePaths } = await dialog.showOpenDialog({
		defaultPath: remote.app.getPath('downloads'),
		properties: ['openDirectory'],
		title: 'Select folder to store files.',
	});

	if (filePaths.length < 0) return null;

	const path = filePaths[0];
	localStorage.setItem('download-path', path);
	return path;
}

function getStoragePath() {
	return (
		localStorage.getItem('download-path') || remote.app.getPath('downloads')
	);
}

export { choosePath, getStoragePath };
