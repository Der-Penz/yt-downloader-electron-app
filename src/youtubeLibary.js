import { updateProgress } from './utilis.js';
import { showSuccess } from './notification.js';
import { resetDownload } from './render.js';

const cp = require('child_process');
const ytdl = require('ytdl-core');
const fs = require('fs');
const readline = require('readline');
const ffmpegStatic = require('ffmpeg-static');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const UPDATE_PERIOD = 100;
let updated = false;

// function downloadVideo(url, filePath, title) {
// 	console.log('Downloading video...');
// 	console.time('Download');

// 	const videoObject = ytdl(url, { quality: 'highestvideo' });

// 	updateProgress(0, undefined, true);

// 	const startTime = Date.now();

// 	videoObject.pipe(fs.createWriteStream(`${filePath}/${title}.mp4`));

// 	videoObject.on('progress', (chunkLength, downloaded, total) => {
// 		const progress = downloaded / total;

// 		if (!updated) {
// 			updateProgress(
// 				progress * 100,
// 				[downloaded, total],
// 				true,
// 				Date.now() - startTime
// 			);
// 			updated = true;
// 			setTimeout(() => {
// 				updated = false;
// 			}, 500);
// 		}

// 		console.log('Progress: ', progress);
// 	});

// 	videoObject.on('finish', () => {
// 		updateProgress(100, undefined, true, Date.now() - startTime);
// 		setTimeout(() => {
// 			updateProgress(0, undefined, false);
// 		}, 1000);

// 		showSuccess(
// 			`Download complete! took ${(Date.now() - startTime) / 1000}s`,
// 			4000
// 		);
// 		console.timeEnd('Download');
// 	});
// }

function downloadAudio(url, filePath, title) {
	const videoObject = ytdl(url, {
		quality: 'highestaudio',
		filter: 'audio',
	});

	updateProgress(0, undefined, true);

	console.log('Downloading audio...');
	videoObject.on('progress', (chunkLength, downloaded, total) => {
		const progress = downloaded / total;

		if (!updated) {
			updateProgress(
				progress * 100,
				[downloaded, total],
				true,
				Date.now() - startTime
			);
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

			showSuccess(
				`Download complete! took ${(Date.now() - startTime) / 1000}s`,
				4000
			);
			console.timeEnd('Download');
			resetDownload();
		});
}

async function getVideoInfo(url) {
	return await ytdl.getInfo(url);
}

function isValidURL(url) {
	return ytdl.validateURL(url);
}

async function downloadVideo(url, filePath, title) {
	const tracker = {
		audio: { downloaded: 0, total: Infinity },
		video: { downloaded: 0, total: Infinity },
		merged: { frame: 0, speed: '0x', fps: 0 },
	};

	// Get audio and video streams
	const audioObject = ytdl(url, { quality: 'highestaudio' }).on(
		'progress',
		(chunkLength, downloaded, total) => {
			tracker.audio = { downloaded, total };
		}
	);
	const videoObject = ytdl(url, { quality: 'highestvideo' }).on(
		'progress',
		(chunkLength, downloaded, total) => {
			tracker.video = { downloaded, total };
		}
	);

	console.time('Download');
	const startTime = Date.now();

	updateProgress(0, undefined, true, 0);

	let progressInterval = null;
	const showProgress = () => {
		const alreadyDownloaded =
			tracker.audio.downloaded + tracker.video.downloaded;
			console.log(alreadyDownloaded, tracker.audio.downloaded, tracker.video.downloaded);
		const totalDownload =
			tracker.audio.total + tracker.video.total;

		updateProgress(
			(alreadyDownloaded / totalDownload) * 100,
			[alreadyDownloaded, totalDownload],
			true,
			Date.now() - startTime
		);
	};

	// Start the ffmpeg child process
	const ffmpegProcess = cp.spawn(
		ffmpegStatic,
		[
			// Remove ffmpeg's console spamming
			'-loglevel',
			'8',
			'-hide_banner',
			// Redirect/Enable progress messages
			'-progress',
			'pipe:3',
			// Set inputs
			'-i',
			'pipe:4',
			'-i',
			'pipe:5',
			// Map audio & video from streams
			'-map',
			'0:a',
			'-map',
			'1:v',
			// Keep encoding
			'-c:v',
			'copy',
			// Define output file
			`${filePath}/${title}.mp4`,
		],
		{
			windowsHide: true,
			stdio: [
				/* Standard: stdin, stdout, stderr */
				'inherit',
				'inherit',
				'inherit',
				/* Custom: pipe:3, pipe:4, pipe:5 */
				'pipe',
				'pipe',
				'pipe',
			],
		}
	);

	ffmpegProcess.on('close', () => {
		updateProgress(100, undefined, true, Date.now() - startTime);
		setTimeout(() => {
			updateProgress(0, undefined, false);
		}, 1000);

		showSuccess(
			`Download complete! took ${(Date.now() - startTime) / 1000}s`,
			4000
		);
		console.timeEnd('Download');
		clearInterval(progressInterval);
		resetDownload();
	});

	// Link streams
	// FFmpeg creates the transformer streams and we just have to insert / read data
	ffmpegProcess.stdio[3].on('data', (chunk) => {
		if (!progressInterval) {
			progressInterval = setInterval(() => {
				showProgress();
			}, UPDATE_PERIOD);
		}
		// Parse the param=value list returned by ffmpeg
		const lines = chunk.toString().trim().split('\n');
		const args = {};
		for (const l of lines) {
			const [key, value] = l.split('=');
			args[key.trim()] = value.trim();
		}
		tracker.merged = args;
	});
	audioObject.pipe(ffmpegProcess.stdio[4]);
	videoObject.pipe(ffmpegProcess.stdio[5]);
}

export { downloadVideo, downloadAudio, getVideoInfo, isValidURL };
