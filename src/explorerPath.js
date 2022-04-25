const { dialog } = require('@electron/remote');

async function choosePath(fileName) {
	const { filePath } = await dialog.showSaveDialog({
		buttonLabel: 'Choose Path',
		defaultPath: fileName,
	});

	return filePath.split('.')[0];
}

export default choosePath;
