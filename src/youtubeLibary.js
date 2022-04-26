import { updateProgress } from './utilis.js';

const ytdl = require('ytdl-core');
const fs = require('fs');
const readline = require('readline');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const UPDATE_PERIOD = 100;
let updated = false;

async function downloadVideo(url, filePath, title) {
	console.log('Downloading video...');
	console.time('Download');

	const videoObject = ytdl(url, { quality: 'highestvideo' });

	updateProgress(0, undefined, true);

	const startTime = Date.now();

	videoObject.pipe(fs.createWriteStream(`${filePath}/${title}.mp4`));

	videoObject.on('progress', (chunkLength, downloaded, total) => {
		const progress = downloaded / total;

		if (!updated) {
			updateProgress(progress * 100, [downloaded, total], true, Date.now() - startTime);
			updated = true;
			setTimeout(() => {
				updated = false;
			}, 500);
		}

		console.log('Progress: ', progress);
	});

	videoObject.on('finish', () => {

		updateProgress(100, undefined, true, Date.now() - startTime);
		setTimeout(() => {
			updateProgress(0, undefined,  false);
		}, 1000);

		console.log('Download complete!', `Saved to ${filePath}`);
		console.timeEnd('Download');
	});
}

async function downloadAudio(url, filePath, title) {
	const videoObject = ytdl(url, {
		quality: 'highestaudio',
		filter: 'audio',
	});

	updateProgress(0, undefined, true);

	console.log('Downloading audio...');
	console.time('Download');

	videoObject.on('progress', (chunkLength, downloaded, total) => {
		const progress = downloaded / total;

		if (!updated) {
			updateProgress(progress * 100, [downloaded, total], true, Date.now() - startTime);
			updated = true;
			setTimeout(() => {
				updated = false;
			}, UPDATE_PERIOD);
		}

		console.log('Progress: ', progress);
	});

	const startTime = Date.now();

	ffmpeg(videoObject)
		.audioBitrate(128)
		.save(`${filePath}/${title}.mp3`)
		.on('end', () => {

			updateProgress(100, undefined, true, Date.now() - startTime);
			setTimeout(() => {
				updateProgress(0, undefined, false);
			}, 1000);

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

export { downloadVideo, downloadAudio, getVideoInfo, isValidURL };
