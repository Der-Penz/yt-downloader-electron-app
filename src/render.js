import {
	downloadVideo,
	downloadAudio,
	downloadPartly,
	getVideoInfo,
	isValidVideoURL,
	isValidPlaylistURL,
	getPlaylistInfo,
} from './youtubeLibary.js';
import { showError, showInfo } from './notification.js';
import { getStoragePath, doesFileExist } from './explorerPath.js';
import { formatSeconds } from './utilis.js';
import {
	setInformation,
	getTitle,
	showSettingsUI,
	getInput,
	resetInput,
	clearInput,
	resetTimeline,
	setFormats,
	getDownloadType,
	getSelectedRange,
	getFormat,
} from './uiHandler.js';

const remote = require('@electron/remote');
const window = remote.getCurrentWindow();

const loadButton = document.querySelector('.load');
const downloadButton = document.querySelector('.download');
const closeButton = document.querySelector('.close');

let downloadInProgress = false;
const URLS = {
	video: '',
	playlist: '',
};

//handle the load button
loadButton.addEventListener('click', () => {
	const value = getInput();

	//check if the URL is a valid video URL
	if (isValidVideoURL(value)) {
		URLS.video = value;

		clearInput();
		addVideo(URLS.video);
	}
	//check if the URl is a valid playlist URL
	if (isValidPlaylistURL(value)) {
		URLS.playlist = value;

		clearInput();
		addPlaylist(URLS.playlist);
	}
});

//handle the download button
downloadButton.addEventListener('click', () => {
	if (!URLS.video && !URLS.playlist) {
		showError('Please load a video or playlist first');
		return;
	}

	downloadCurrent(URLS.video || URLS.playlist, getTitle());
});

//close window
closeButton.addEventListener('click', () => {
	window.close();
});

async function addVideo(url) {
	showSettingsUI('video');

	//get the video information
	const {
		formats,
		videoDetails: {
			title,
			author: { name: creator },
			video_url,
			thumbnails,
			lengthSeconds,
		},
	} = await getVideoInfo(url);

	setInformation(title, creator, thumbnails[0].url, video_url);
	resetTimeline(lengthSeconds);
	setFormats(formats);

	showInfo('Video loaded');
}

async function addPlaylist(url) {
	showSettingsUI('playlist');

	const playlistInformation = await getPlaylistInfo(url);

	const {
		title,
		author: { name },
		url: videoURL,
		bestThumbnail: { url: thumbnailURL },
	} = playlistInformation;

	setInformation(title, name, thumbnailURL, videoURL);
}

async function downloadCurrent(url, fileName) {
	if (downloadInProgress) {
		showError('A Download is already in progress');
		return;
	}

	const path = getStoragePath();
	const downloadType = getDownloadType();

	if (doesFileExist(path, fileName, downloadType)) {
		showError('File already exists, choose a different name');
		return;
	}

	downloadInProgress = true;

	if (URLS.playlist){
		const {items} = await getPlaylistInfo(url);
		URLS.playlistURLS = items;
		URLS.index = 0;
	 	downloadPlaylist(path, fileName, downloadType);
	}	
	if (URLS.video) downloadSingle(url, path, fileName, downloadType);
}

async function downloadPlaylist(filePath, titleAddition, downloadType) {
	const i = URLS.index;
	let title = (
		URLS.playlistURLS[i].title + (titleAddition || '')
	).substring(0, 50);
	title.replace(/([^a-z0-9 - (%!&=)]+)/gi, '-');
	const url = URLS.playlistURLS[i].url;
	console.log('downloading ', url);
	if (doesFileExist(filePath, title, downloadType)) {
		title += i;
	}

	if (downloadType === 'mp4')
		downloadVideo(url, filePath, title, getFormat());
	else if (downloadType === 'mp3') downloadAudio(url, filePath, title);
}

function downloadSingle(url, filePath, fileName, downloadType) {
	const { min, max, valueMin, valueMax } = getSelectedRange();

	//if no range is selected, download the whole video
	if (min === valueMin && max === valueMax) {
		if (downloadType === 'mp3') downloadAudio(url, filePath, fileName);
		else if (downloadType === 'mp4') {
			downloadVideo(url, filePath, fileName, getFormat()).then(() =>
				console.log('then')
			);
		}
	}
	//if a range is selected, download the selected range
	else {
		console.log(downloadType);
		const valueStart = formatSeconds(valueMin);
		const valueEnd = formatSeconds(valueMax);
		downloadPartly(
			url,
			filePath,
			fileName,
			downloadType,
			valueStart,
			valueEnd
		);
	}
}

export function resetDownload() {
	showInfo('Ready for a new download', 1500);
	downloadInProgress = false;
	if(URLS.playlistURLS){
		URLS.index++;
		if(URLS.index === URLS.playlistURLS.length){
			delete URLS.playlistURLS;
			delete URLS.index;
		}else{
			downloadPlaylist(getStoragePath(), getTitle(), getDownloadType());
			return;
		}
	}

	resetInput(URLS.video || URLS.playlist);
	setInformation('Video title ...', 'from - ...', 'placeholder.png', '');
	URLS.video = URLS.playlist = '';
}
