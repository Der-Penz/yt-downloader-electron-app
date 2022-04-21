const ytdl = require('ytdl-core');
const fs = require('fs');

async function downloadVideo(url, filePath, format = FORMATS.audio, quality = QUALIATY.highestaudio) {

	console.log('Downloading video...');
	console.time('Download');

	ytdl(url, { quality: quality, filter: format})
		.pipe(fs.createWriteStream(`${filePath}.mp3`))
		.on('finish', () => {
			console.log('Download complete!', `Saved to ${filePath}`);
			console.timeEnd('Download');
		});
}

async function getVideoInfo(url) {
    return await ytdl.getInfo(url);
}

function isValidURL(url) {
    return ytdl.validateURL(url);
}

const FORMATS = Object.freeze({
    'audio': 'audio',
    'video': 'video',
});

const QUALIATY = Object.freeze({
    'highest': 'highest',
    'highestaudio': 'highestaudio',
    'highestvideo': 'highestvideo',
    'lowest': 'lowest',
    'lowestaudio': 'lowestaudio',
    'lowestvideo': 'lowestvideo',
});

export { FORMATS, QUALIATY, downloadVideo, getVideoInfo, isValidURL };