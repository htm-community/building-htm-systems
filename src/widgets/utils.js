// Loads given html into an element, calls the cb one time when loaded.
function loadHtml(html, elementId, cb) {
    let $el = $('#' + elementId)
    $el.one('DOMNodeInserted', cb)
    $el.html(html)
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function precisionRound(number, precision) {
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

module.exports = {
    loadHtml: loadHtml,
    getRandomInt: getRandomInt,
    getRandomArbitrary: getRandomArbitrary,
    precisionRound: precisionRound,
}
