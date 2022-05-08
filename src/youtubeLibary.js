import { toggleProgress, updateProgress } from './uiHandler.js';
import { showSuccess } from './notification.js';
import { resetDownload } from './render.js';

const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const fs = require('fs');
const cp = require('child_process');
const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegStatic);

export async function downloadVideo(url, filePath, title, format = 'highestvideo') {
	const progress = {
		audio: { downloaded: 0, total: 0 },
		video: { downloaded: 0, total: 0 },
	};

	const audioObject = ytdl(url, { quality: 'highestaudio' }).on(
		'progress',
		(chunkLength, downloaded, total) => {
			progress.audio = { downloaded, total };
		}
	);
	const videoObject = ytdl(url, { quality: format }).on(
		'progress',
		(chunkLength, downloaded, total) => {
			progress.video = { downloaded, total };
		}
	);

	const startTime = Date.now();

	toggleProgress(true);
	updateProgress();

	const showProgress = () => {
		const alreadyDownloaded =
			progress.audio.downloaded + progress.video.downloaded;
		const totalDownload = progress.audio.total + progress.video.total;

		updateProgress(
			[alreadyDownloaded, totalDownload],
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
		downloadComplete(startTime);
	});

	// Link streams
	// FFmpeg creates the transformer streams and we just have to insert / read data
	ffmpegProcess.stdio[3].on('data', (chunk) => {
		showProgress();
	});
	audioObject.pipe(ffmpegProcess.stdio[4]);
	videoObject.pipe(ffmpegProcess.stdio[5]);
}

export function downloadAudio(url, filePath, title) {
	const videoObject = ytdl(url, {
		quality: 'highestaudio',
		filter: 'audio',
	});

	toggleProgress(true);
	updateProgress();

	videoObject.on('progress', (chunkLength, downloaded, total) => {
		updateProgress([downloaded, total], Date.now() - startTime);
	});

	const startTime = Date.now();

	ffmpeg(videoObject)
		.audioBitrate(128)
		.save(`${filePath}/${title}.mp3`)
		.on('end', () => {
			downloadComplete(startTime);
		});
}

export function downloadPartly(
	url,
	filePath,
	title,
	downloadType,
	timeStart = '0:01:00',
	timeDuration = '0:00:10'
) {
	const videoObject = ytdl(url);

	const startTime = Date.now();

	toggleProgress(true);
	updateProgress();

	videoObject.on('progress', (chunkLength, downloaded, total) => {
		updateProgress([downloaded, total], Date.now() - startTime);
	});

	videoObject
		.pipe(fs.createWriteStream(`${filePath}/tmp.mp4`))
		.on('finish', () => {
			const ffmpegProcess = cp.spawn(
				ffmpegStatic,
				[
					'-y',
					'-v',
					'error',
					'-progress',
					'pipe:3',
					'-i',
					`${filePath}/tmp.mp4`,
					'-vcodec',
					'copy',
					'-acodec',
					'copy',
					'-ss',
					timeStart,
					'-t',
					timeDuration,
					'-f',
					'matroska',
					'pipe:4',
				],
				{
					windowsHide: true,
					stdio: ['inherit', 'inherit', 'inherit', 'pipe', 'pipe'],
				}
			);

			ffmpegProcess.on('close', () => {
				fs.rmSync(`${filePath}/tmp.mp4`, {
					force: true,
				});
				downloadComplete(startTime);
			});

			ffmpegProcess.stdio[4].pipe(
				fs.createWriteStream(`${filePath}/${title}.mp4`)
			);
		});
}

function downloadComplete(startTime) {
	updateProgress([100, 100], Date.now() - startTime);
	// setTimeout(() => {
	// 	toggleProgress(false);
	// 	updateProgress();
	// }, 1000);
	showSuccess(
		`Download complete! took ${(Date.now() - startTime) / 1000}s`,
		4000
	);
	resetDownload();
}

export async function getVideoInfo(url) {
	return await ytdl.getInfo(url);
}

export async function getPlaylistInfo(url) {
	return await ytpl(url);
}

export function isValidPlaylistURL(id) {
	return ytpl.validateID(id);
}

export function isValidVideoURL(url) {
	return ytdl.validateURL(url);
}
