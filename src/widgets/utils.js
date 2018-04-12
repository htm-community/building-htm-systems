// Loads given html into an element, calls the cb one time when loaded.
function loadHtml(html, elementId, cb) {
    let $el = $('#' + elementId)
    $el.one('DOMNodeInserted', cb)
    $el.html(html)
}

module.exports = {
    loadHtml: loadHtml,
}
