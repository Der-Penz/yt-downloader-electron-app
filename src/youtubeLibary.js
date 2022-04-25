const ytdl = require('ytdl-core');
const fs = require('fs');
const readline = require('readline');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

async function downloadVideo(url, filePath) {
	console.log('Downloading video...');
	console.time('Download');

	const startTime = Date.now();
	let endTime;
	ytdl(url, { quality: 'highestvideo' })
		.pipe(fs.createWriteStream(`${filePath}.mp4`))
		.on('finish', () => {
			endTime = Date.now();
			console.log('Download complete!', `Saved to ${filePath}`);
			console.timeEnd('Download');
			return endTime - startTime;
		});
}

async function downloadAudio(url, filePath) {
	const stream = ytdl(url, {
		quality: 'highestaudio',
		filter: 'audio',
	});

	console.log('Downloading audio...');
	console.time('Download');

	const startTime = Date.now();
	let endTime;
	ffmpeg(stream)
		.audioBitrate(128)
		.save(`${filePath}.mp3`)
		.on('end', () => {
			endTime = Date.now();
			console.log('Download complete!', `Saved to ${filePath}`);
			console.timeEnd('Download');
			return endTime - startTime;
		});
}

async function getVideoInfo(url) {
	return await ytdl.getInfo(url);
}

function isValidURL(url) {
	return ytdl.validateURL(url);
}

// const FORMATS = Object.freeze({
// 	audio: 'audio',
// 	video: 'video',
// });

// const QUALIATY = Object.freeze({
// 	highest: 'highest',
// 	highestaudio: 'highestaudio',
// 	highestvideo: 'highestvideo',
// 	lowest: 'lowest',
// 	lowestaudio: 'lowestaudio',
// 	lowestvideo: 'lowestvideo',
// });

export {
	// FORMATS,
	// QUALIATY,
	downloadVideo,
	downloadAudio,
	getVideoInfo,
	isValidURL,
};
