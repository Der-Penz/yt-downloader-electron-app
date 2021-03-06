import { choosePath } from './explorerPath.js';
import { showInfo } from './notification.js';
import { formatSeconds, sortFormats, toMegaByte } from './utilis.js';

const VIDEO_MIN_LENGTH = 1;

const INFORMATION_ELEMENTS = {
	thumbnail: document.querySelector('.thumbnail'),
	title: document.querySelector('.video-title'),
	author: document.querySelector('.creator'),
	link: document.querySelector('.video-link'),
};

const DOWNLOAD_SETTINGS_ELEMENTS = {
	playlist: document.querySelector('.settings-playlist'),
	video: document.querySelector('.settings-video'),
};

const TIMELINE_ELEMENTS = {
	labelStart: document.querySelector('.times .start'),
	labelEnd: document.querySelector('.times .end'),
	timelineStart: document.querySelector('.timeline .start'),
	timelineEnd: document.querySelector('.timeline .end'),
};

const SETTINGS_ELEMENTS = {
	button: document.querySelector('.settings'),
	open: document.querySelector('.settings-open'),
	close: document.querySelector('.settings-close'),
};

const PROGRESS_ELEMENTS = {
	container: document.querySelector('.progress-container'),
	div: document.querySelector('.progress'),
	text: document.querySelector('.progress-text'),
};

const PLAYLIST_ELEMENTS = {
	label: document.querySelector('.count-label'),
	range: document.querySelector('.count-range'),
}

const inputURL = document.querySelector('.url-input');
const formatSelection = document.querySelector('.selection-quality');
const choosePathButton = document.querySelector('.base-path');

const MAX_VIDEO_TITLE_LENGTH = 50;

//---------------------------------------------------------------------------------------------------------------------

TIMELINE_ELEMENTS.timelineStart.addEventListener('input', () => {
	const start = parseInt(TIMELINE_ELEMENTS.timelineStart.value);
	const end = parseInt(TIMELINE_ELEMENTS.timelineEnd.value);

	if (end - start <= VIDEO_MIN_LENGTH)
		TIMELINE_ELEMENTS.timelineStart.value =
			parseInt(TIMELINE_ELEMENTS.timelineEnd.value) - VIDEO_MIN_LENGTH;

	updateTimelineLabels();
});

TIMELINE_ELEMENTS.timelineEnd.addEventListener('input', () => {
	const start = parseInt(TIMELINE_ELEMENTS.timelineStart.value);
	const end = parseInt(TIMELINE_ELEMENTS.timelineEnd.value);

	if (end - start <= VIDEO_MIN_LENGTH)
		TIMELINE_ELEMENTS.timelineEnd.value =
			parseInt(TIMELINE_ELEMENTS.timelineStart.value) + VIDEO_MIN_LENGTH;

	updateTimelineLabels();
});

SETTINGS_ELEMENTS.open.addEventListener('click', () => {
	SETTINGS_ELEMENTS.button.setAttribute('state', 'closed');
});

SETTINGS_ELEMENTS.close.addEventListener('click', () => {
	SETTINGS_ELEMENTS.button.setAttribute('state', 'opened');
});

choosePathButton.addEventListener('click', async () => {
	await choosePath() && showInfo(`Path changed`);
});

PLAYLIST_ELEMENTS.range.addEventListener('input', (e) => {
	setPlaylistCount(e.target.value, e.target.max);
});

//---------------------------------------------------------------------------------------------------------------------

export function setInformation(title, author, thumbnail, link) {
	INFORMATION_ELEMENTS.title.innerHTML = title;
	INFORMATION_ELEMENTS.author.innerHTML = `from - ${author}`;
	INFORMATION_ELEMENTS.thumbnail.src = thumbnail;
	INFORMATION_ELEMENTS.link.href = link;
}

export function getTitle(maxLength = MAX_VIDEO_TITLE_LENGTH) {
	const title =
		inputURL.value ||
		INFORMATION_ELEMENTS.title.innerText.substring(0, maxLength);
	return title.replace(/([^a-z0-9 - (%!&=)]+)/gi, '-');
}

export function showSettingsUI(type) {
	if (type === 'playlist') {
		DOWNLOAD_SETTINGS_ELEMENTS.playlist.classList.remove('hidden');
		DOWNLOAD_SETTINGS_ELEMENTS.video.classList.add('hidden');
	} else if (type === 'video') {
		DOWNLOAD_SETTINGS_ELEMENTS.playlist.classList.add('hidden');
		DOWNLOAD_SETTINGS_ELEMENTS.video.classList.remove('hidden');
	}else{
		DOWNLOAD_SETTINGS_ELEMENTS.playlist.classList.add('hidden');
		DOWNLOAD_SETTINGS_ELEMENTS.video.classList.add('hidden');
	}
}

export function resetInput(alternativeURL) {
	inputURL.value = alternativeURL || '';
	inputURL.placeholder = 'Enter a Playlist or Video URL';
}

export function clearInput() {
	inputURL.value = '';
	inputURL.placeholder = 'Enter a alternative file name';
}

export function getInput() {
	return inputURL.value;
}

function updateTimelineLabels() {
	TIMELINE_ELEMENTS.labelStart.innerText = `${formatSeconds(
		TIMELINE_ELEMENTS.timelineStart.value
	)}s`;
	TIMELINE_ELEMENTS.labelEnd.innerText = `${formatSeconds(
		TIMELINE_ELEMENTS.timelineEnd.value
	)}s`;
}

export function resetTimeline(videoLength) {
	TIMELINE_ELEMENTS.timelineStart.min = 0;
	TIMELINE_ELEMENTS.timelineEnd.min = 0;
	TIMELINE_ELEMENTS.timelineStart.max = videoLength;
	TIMELINE_ELEMENTS.timelineEnd.max = videoLength;
	TIMELINE_ELEMENTS.timelineStart.value = 0;
	TIMELINE_ELEMENTS.timelineEnd.value = videoLength;

	updateTimelineLabels();
}

export function getSelectedRange() {
	const min = parseInt(TIMELINE_ELEMENTS.timelineStart.min);
	const max = parseInt(TIMELINE_ELEMENTS.timelineEnd.max);
	const valueMin = parseInt(TIMELINE_ELEMENTS.timelineStart.value);
	const valueMax = parseInt(TIMELINE_ELEMENTS.timelineEnd.value);
	return { min, max, valueMin, valueMax };
}

export function setFormats(formats) {
	//append the best quality option first
	formatSelection.innerHTML = '';
	const highestOption = document.createElement('option');
	highestOption.value = 'highestvideo';
	highestOption.innerText = 'Highest Quality';
	formatSelection.appendChild(highestOption);

	if(!formats) return;

	const sortedFormats = sortFormats(formats);
	sortedFormats.forEach((format) => {
		const formatOption = document.createElement('option');
		formatOption.value = format.itag;
		formatOption.innerText = format.qualityLabel;
		formatSelection.appendChild(formatOption);
	});
}

export function getFormat() {
	return formatSelection.value || 'highestvideo';
}

export function getDownloadType() {
	return document.querySelector('input[name="download-type"]:checked').value;
}

export function toggleProgress(visible) {
	PROGRESS_ELEMENTS.container.style.display = visible ? 'flex' : 'none';
}

export function updateProgress(progress = [0, 0], time = 0) {
	const percent = Math.round((progress[0] / progress[1]) * 100) || 0;
	const asMegaByte = progress.map((byte) => toMegaByte(byte) + 'MB');

	PROGRESS_ELEMENTS.div.style.width = `${percent}%`;
	PROGRESS_ELEMENTS.text.innerText = `${percent}% | ${asMegaByte[0]} / ${
		asMegaByte[1]
	} | ${(time / 1000).toFixed(2)}s`;
}

export function getPlaylistCount() {
	return parseInt(PLAYLIST_ELEMENTS.range.value);
}

export function resetPlaylistCount(max){
	PLAYLIST_ELEMENTS.range.min = 1;
	PLAYLIST_ELEMENTS.range.max = max;
	PLAYLIST_ELEMENTS.range.value = 1;
	PLAYLIST_ELEMENTS.label.innerText = `${1}/${max} Videos`; 
}

function setPlaylistCount(count, max){
	PLAYLIST_ELEMENTS.label.innerText = `${count}/${max} Videos`; 
}

