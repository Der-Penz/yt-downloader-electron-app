import {
	FORMATS,
	QUALIATY,
	downloadVideo as dV,
	getVideoInfo,
	isValidURL,
} from './youtubeLibary.js';
import choosePath from './explorerPath.js';
import { formatSeconds } from './utilis.js';

const inputURL = document.querySelector('.url-input');
const loadButton = document.querySelector('.load');
const thumbnail = document.querySelector('.thumbnail');
const videoTitle = document.querySelector('.video-title');
const videoCreator = document.querySelector('.creator');
const videoTimeline = document.querySelector('.timeline');
const timelineStart = document.querySelector('.times .start');
const timelineEnd = document.querySelector('.times .end');
const downloadButton = document.querySelector('.download');
const videoLink = document.querySelector('.video-link');

var videoLoaded = false;

loadButton.addEventListener('click', () => {
	console.log('adding video');
	addVideo(inputURL.value);
});

downloadButton.addEventListener('click', () => {
	if (!videoLoaded) {
		console.error('Error : No video added');
		return;
	}
	downloadVideo(inputURL.value, videoTitle.innerText);
});

videoTimeline.addEventListener('change', () => {
	if (!videoLoaded) {
		console.error('Error : No video added');
		return;
	}
	updateTimeline();
});

async function addVideo() {
	const URL = inputURL.value;
	const videoInformation = await getVideoInfo(URL);
	console.log(videoInformation);

	//setting the html elements
	thumbnail.src =
		videoInformation.player_response.videoDetails.thumbnail.thumbnails[0].url;
	videoTitle.innerText = videoInformation.player_response.videoDetails.title;
	videoCreator.innerText = `from ${videoInformation.player_response.videoDetails.author}`;
	videoTimeline.min = 0;
	videoTimeline.max =
		videoInformation.player_response.videoDetails.lengthSeconds;
	videoLink.href = URL;

	updateTimeline();

	videoLoaded = true;
}

async function downloadVideo(url, fileName = `Video-${Date.now()}`) {
	const filePath = await choosePath(fileName);

	console.log(filePath);

	if (!isValidURL(url)) {
		console.error('Error : Invalid URL');
		return;
	}

	dV(url, filePath, FORMATS.audio, QUALIATY.highestaudio);
	// const info = await ytdl.getInfo(url);
	// console.log(info);
	// let audioFormats = await ytdl.filterFormats(info.formats, 'audioonly');
	// console.log(audioFormats);
	// let format = await ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });
	// console.log(format);
	// console.log('Downloading video...');
	// console.time('Download');
}

function updateTimeline() {
	timelineStart.innerText = `${formatSeconds(videoTimeline.value)}s`;
	timelineEnd.innerText = `${formatSeconds(videoTimeline.max)}s`;
}
