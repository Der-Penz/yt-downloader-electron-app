import {
	downloadVideo,
	downloadAudio,
	getVideoInfo,
	isValidURL,
} from './youtubeLibary.js';
import { showError, showInfo } from './notification.js';
import { choosePath, getStoragePath, doesFileExist } from './explorerPath.js';
import { formatSeconds } from './utilis.js';

const remote = require('@electron/remote');
const window = remote.getCurrentWindow();

const inputURL = document.querySelector('.url-input');
const loadButton = document.querySelector('.load');
const closeButton = document.querySelector('.close');
const settingsButton = document.querySelector('.settings');
const settingsOpenButton = document.querySelector('.settings-open');
const settingsCloseButton = document.querySelector('.settings-close');
const choosePathButton = document.querySelector('.base-path');
const thumbnail = document.querySelector('.thumbnail');
const videoTitle = document.querySelector('.video-title');
const videoCreator = document.querySelector('.creator');
const timesStart = document.querySelector('.times .start');
const timesEnd = document.querySelector('.times .end');
const timelineStart = document.querySelector('.timeline .start');
const timelineEnd = document.querySelector('.timeline .end');
const formatSelection = document.querySelector('.selection-quality');
const downloadButton = document.querySelector('.download');
const videoLink = document.querySelector('.video-link');

let videoLoaded = false;
let downloading = false;
let videoURL = '';
const VIDEO_MIN_LENGTH = 1;
const MAX_VIDEO_TITLE_LENGTH = 50;

//#region Event Listeners

loadButton.addEventListener('click', () => {
	const value = inputURL.value;

	if (!value.includes('watch?v=')) return;

	videoURL = value;
	if (!isValidURL(videoURL)) {
		showError('Please enter a valid URL');
		return;
	}

	inputURL.value = '';
	inputURL.placeholder = 'Enter a alternative file name';
	addVideo(videoURL);
});

downloadButton.addEventListener('click', () => {
	if (!videoLoaded) {
		showError('Please load a video first');
		return;
	}

	const title =
		inputURL.value ||
		videoTitle.innerText.substring(0, MAX_VIDEO_TITLE_LENGTH);

	downloadCurrent(videoURL, title.replace(/([^a-z0-9 - (%!&=)]+)/gi, '-'));
});

closeButton.addEventListener('click', () => {
	window.close();
});

timelineStart.addEventListener('input', () => {
	const valueStart = parseInt(timelineStart.value);
	const valueEnd = parseInt(timelineEnd.value);

	if (valueEnd - valueStart <= VIDEO_MIN_LENGTH)
		timelineStart.value = parseInt(timelineEnd.value) - VIDEO_MIN_LENGTH;

	updateTimeline();
});

timelineEnd.addEventListener('input', () => {
	const valueStart = parseInt(timelineStart.value);
	const valueEnd = parseInt(timelineEnd.value);

	if (valueEnd - valueStart <= VIDEO_MIN_LENGTH)
		timelineEnd.value = parseInt(timelineStart.value) + VIDEO_MIN_LENGTH;

	updateTimeline();
});

settingsOpenButton.addEventListener('click', () => {
	settingsButton.setAttribute('state', 'closed');
});

settingsCloseButton.addEventListener('click', () => {
	settingsButton.setAttribute('state', 'opened');
});

choosePathButton.addEventListener('click', async () => {
	await choosePath();
	showInfo('Path changed');
});

//#endregion

async function addVideo(URL) {
	const videoInformation = await getVideoInfo(URL);

	const videoFormats = videoInformation.formats
		.filter((format) => format.hasVideo == true && format.quality != 'tiny')
		.sort((a, b) => {
			var qualA = parseInt(a.qualityLabel);
			var qualB = parseInt(b.qualityLabel);
			if (qualA < qualB) {
				return 1;
			}
			if (qualA > qualB) {
				return -1;
			}
			return 0;
		});

	//setting the html elements
	thumbnail.src =
		videoInformation.player_response.videoDetails.thumbnail.thumbnails[0].url;
	videoTitle.innerText = videoInformation.player_response.videoDetails.title;
	videoCreator.innerText = `from - ${videoInformation.player_response.videoDetails.author}`;

	//timeline
	const videoLength =
		videoInformation.player_response.videoDetails.lengthSeconds;
	timelineStart.min = 0;
	timelineEnd.min = 0;
	timelineStart.max = videoLength;
	timelineEnd.max = videoLength;
	timelineStart.value = timelineStart.min;
	timelineEnd.value = timelineEnd.max;

	videoLink.href = URL;

	//formats
	formatSelection.innerHTML = '';
	const highestOption = document.createElement('option');
	highestOption.value = 'highestvideo';
	highestOption.innerText = 'Highest Quality';
	formatSelection.appendChild(highestOption);

	videoFormats.forEach((format) => {
		const option = document.createElement('option');
		option.value = format.itag;
		option.innerText = format.qualityLabel;
		formatSelection.appendChild(option);
	});

	updateTimeline();

	videoLoaded = true;
	showInfo('Video loaded');
}

function downloadCurrent(url, fileName) {
	if (downloading) {
		showError('A Download is already in progress');
		return;
	}

	const filePath = getStoragePath();

	const downloadType = document.querySelector(
		'input[name="download-type"]:checked'
	).value;

	if(doesFileExist(filePath, fileName, downloadType)) {
		showError('File already exists, choose a different name');
		return;
	}

	downloading = true;

	if (downloadType === 'mp3') downloadAudio(url, filePath, fileName);
	else if (downloadType === 'mp4') {
		let format = document.querySelector('.selection-quality').value;
		downloadVideo(url, filePath, fileName, format);
	}
}

function updateTimeline() {
	timesStart.innerText = `${formatSeconds(timelineStart.value)}s`;
	timesEnd.innerText = `${formatSeconds(timelineEnd.value)}s`;
}

function resetDownload() {
	showInfo('Ready for a new download', 1500);
	downloading = false;
	inputURL.value = videoURL;
	inputURL.placeholder = 'Paste Video-URL here';
	videoLoaded = false;
}

export { resetDownload };
