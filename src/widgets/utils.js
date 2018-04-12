function loadHtml(html, elementId, cb) {
    console.log("Loading %s HTML", elementId)
    console.log(cb)
    console.log(html)
    let $el = $('#' + elementId)
    $el.one('DOMNodeInserted', () => {
        console.log("Loaded %s HTML", elementId)
        cb()
    })
    $el.html(html)
}

module.exports = {
    loadHtml: loadHtml,
}
