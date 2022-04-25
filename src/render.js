import {
	downloadVideo,
	downloadAudio,
	getVideoInfo,
	isValidURL,
} from './youtubeLibary.js';
import choosePath from './explorerPath.js';
import { formatSeconds } from './utilis.js';

const remote = require('@electron/remote');
const window = remote.getCurrentWindow()

const inputURL = document.querySelector('.url-input');
const loadButton = document.querySelector('.load');
const closeButton = document.querySelector('.close');
const thumbnail = document.querySelector('.thumbnail');
const videoTitle = document.querySelector('.video-title');
const videoCreator = document.querySelector('.creator');
const timesStart = document.querySelector('.times .start');
const timesEnd = document.querySelector('.times .end');
const timelineStart = document.querySelector('.timeline .start');
const timelineEnd = document.querySelector('.timeline .end');
const downloadButton = document.querySelector('.download');
const videoLink = document.querySelector('.video-link');

let videoLoaded = false;
let videoLength = 1;
const VIDEO_MIN_LENGTH = 1;
const MAX_VIDEO_TITLE_LENGTH = 30;

loadButton.addEventListener('click', () => {
	console.log('adding video');
	addVideo(inputURL.value);
});

downloadButton.addEventListener('click', () => {
	if (!videoLoaded) {
		console.error('Error : No video added');
		return;
	}

	downloadCurrent(
		inputURL.value,
		videoTitle.innerText.substring(0, MAX_VIDEO_TITLE_LENGTH)
	);
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

async function addVideo() {
	const URL = inputURL.value;
	const videoInformation = await getVideoInfo(URL);
	
	//setting the html elements
	thumbnail.src =
		videoInformation.player_response.videoDetails.thumbnail.thumbnails[0].url;
	videoTitle.innerText = videoInformation.player_response.videoDetails.title;
	videoCreator.innerText = `from ${videoInformation.player_response.videoDetails.author}`;

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

	updateTimeline();

	videoLoaded = true;
}

async function downloadCurrent(url, fileName) {
	const filePath = await choosePath(fileName);

	if (!filePath) {
		console.error('Error : No path chosen');
		return;
	}

	const downloadType = document.querySelector(
		'input[name="download-type"]:checked'
	).value;

	if (downloadType === 'mp3') downloadAudio(url, filePath);
	else if (downloadType === 'mp4') downloadVideo(url, filePath);
}

function updateTimeline() {
	timesStart.innerText = `${formatSeconds(timelineStart.value)}s`;
	timesEnd.innerText = `${formatSeconds(timelineEnd.value)}s`;
	console.log((timelineStart.value + 1) / timelineEnd.max);
	// timelineEnd.style.width = `${((timelineStart.value + 1) / timelineEnd.max) * 100}%`;
	// timelineEnd.style.width = `${((timelineEnd.value + 1) / timelineStart.max) * 100}%`;
}
