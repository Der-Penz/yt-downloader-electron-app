export function formatSeconds(seconds) {
	var date = new Date(0);
	date.setSeconds(seconds);
	return date.toISOString().substr(12, 7);
}

export function toMegaByte(bytes) {
	return parseFloat(bytes / 1024 / 1024).toFixed(2);
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