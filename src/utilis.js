const progressContainer = document.querySelector('.progress-container');
const progressDiv = document.querySelector('.progress');
const progressText = document.querySelector('.progress-text');

function formatSeconds(seconds) {
    var date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(12, 7);
}

function toMegaByte(bytes) {
    return parseFloat(bytes / 1024 / 1024).toFixed(2);
}

function updateProgress(progress, downloaded = [0, 0], showProgress, time = 0) {
    const asMegaByte = downloaded.map( byte => toMegaByte(byte) + "MB" );

    progressContainer.style.display = showProgress ? 'flex' : 'none';
	progressDiv.style.width = `${Math.round(progress)}%`;
    progressText.innerText = `${Math.round(progress)}% | ${asMegaByte[0]} / ${asMegaByte[1]} | ${(time / 1000).toFixed(2)}s`;
}

export { formatSeconds, updateProgress};