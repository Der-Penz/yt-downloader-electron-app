const PROGRESS_ELEMENTS = {
	container: document.querySelector('.progress-container'),
	div: document.querySelector('.progress'),
	text: document.querySelector('.progress-text'),
};

export function formatSeconds(seconds) {
	var date = new Date(0);
	date.setSeconds(seconds);
	return date.toISOString().substr(12, 7);
}

function toMegaByte(bytes) {
	return parseFloat(bytes / 1024 / 1024).toFixed(2);
}

export function updateProgress(
	progress,
	downloaded = [0, 0],
	showProgress,
	time = 0
) {
	const asMegaByte = downloaded.map((byte) => toMegaByte(byte) + 'MB');

	PROGRESS_ELEMENTS.container.style.display = showProgress ? 'flex' : 'none';
	PROGRESS_ELEMENTS.div.style.width = `${Math.round(progress)}%`;
	PROGRESS_ELEMENTS.text.innerText = `${Math.round(progress)}% | ${
		asMegaByte[0]
	} / ${asMegaByte[1]} | ${(time / 1000).toFixed(2)}s`;
}

export function sortFormats(formats) {
	return formats
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
}
