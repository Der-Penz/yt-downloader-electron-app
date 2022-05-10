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

export function downloadVideo(
	url,
	filePath,
	title,
	format = 'highestvideo',
	cb
) {
	const progress = {
		audio: { downloaded: 0, total: 0 },
		video: { downloaded: 0, total: 0 },
	};

	const audioObject = ytdl(url, { quality: 'highestaudio' });
	audioObject.on('progress', (_, downloaded, total) => {
		progress.audio = { downloaded, total };
	});

	const videoObject = ytdl(url, { quality: format });
	videoObject.on('progress', (_, downloaded, total) => {
		progress.video = { downloaded, total };
	});

	const startTime = Date.now();
	const fullPath = `${filePath}/${title}.mp4`;

	toggleProgress(true);
	updateProgress();

	const ffmpegProcess = cp.spawn(
		ffmpegStatic,
		[
			'-loglevel',
			'8',
			'-hide_banner',
			'-progress',
			'pipe:3',
			'-i',
			'pipe:4',
			'-i',
			'pipe:5',
			'-map',
			'0:a',
			'-map',
			'1:v',
			'-c:v',
			'copy',
			fullPath,
		],
		{
			windowsHide: true,
			stdio: ['inherit', 'inherit', 'inherit', 'pipe', 'pipe', 'pipe'],
		}
	);

	ffmpegProcess.on('close', () => {
		if (cb) cb(fullPath, startTime);
		else downloadComplete(startTime);
	});

	ffmpegProcess.stdio[3].on('data', (_) => {
		const alreadyDownloaded =
			progress.audio.downloaded + progress.video.downloaded;
		const totalDownload = progress.audio.total + progress.video.total;

		updateProgress(
			[alreadyDownloaded, totalDownload],
			Date.now() - startTime
		);
	});
	audioObject.pipe(ffmpegProcess.stdio[4]);
	videoObject.pipe(ffmpegProcess.stdio[5]);
}

export function downloadAudio(url, filePath, title, cb) {
	const videoObject = ytdl(url, {
		quality: 'highestaudio',
		filter: 'audio',
	});

	toggleProgress(true);
	updateProgress();

	videoObject.on('progress', (_, downloaded, total) => {
		updateProgress([downloaded, total], Date.now() - startTime);
	});

	const startTime = Date.now();
	const fullPath = `${filePath}/${title}.mp3`;

	ffmpeg(videoObject)
		.audioBitrate(128)
		.save(fullPath)
		.on('end', () => {
			if (cb) cb(fullPath, startTime);
			else downloadComplete(startTime);
		});
}

export function downloadPartly(
	url,
	filePath,
	title,
	downloadType,
	format,
	timeStart,
	timeEnd
) {
	function cb(fullPath, startTime) {
		const ffmpegProcess = cp.spawn(ffmpegStatic, [
			'-i',
			fullPath,
			'-ss',
			timeStart,
			'-to',
			timeEnd,
			'-c:a',
			'copy',
			`${filePath}/${title}.${downloadType}`,
		]);

		ffmpegProcess.on('close', () => {
			fs.rmSync(fullPath, {
				force: true,
			});

			downloadComplete(startTime);
		});

		// ffmpegProcess.stdio[4].pipe(
		// 	fs.createWriteStream(`${filePath}/${title}.${downloadType}`)
		// );
	}

	const tempTitle = 'tmp' + Date.now().toString();

	if (downloadType === 'mp3') downloadAudio(url, filePath, tempTitle, cb);
	else if (downloadType === 'mp4')
		downloadVideo(url, filePath, tempTitle, format, cb);
}

function downloadComplete(startTime) {
	updateProgress([100, 100], Date.now() - startTime);
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
