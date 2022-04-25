function formatSeconds(seconds) {
    var date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(12, 7);
}
export { formatSeconds };