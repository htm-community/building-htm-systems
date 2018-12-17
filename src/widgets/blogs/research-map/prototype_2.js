let utils = require('../../../lib/utils')
let html = require('./prototype_2.tmpl.html')
let YAML = require('yamljs')
let rawMap = YAML.load('./research-map.yaml')


function isLeaf(node) {
    return node.children === undefined
}

function htmlNodeLoader(node, $el, _name) {
    // Read through hierarchy and create the HTML we need
    // to support the nested accordions

    let $header = $('<h3>')
    let $content = $('<div>')

    if (node.children) {
        debugger;
    } else {
        // It's a map of children
        $header.html('children:')
        let childNames = Object.keys(node)
        let $ul = $('<ul class="accordion">')
        childNames.forEach((name, i) => {
            console.log(name)
            let $li = htmlNodeLoader(node[name], $('<li>'), name)
        })
    }

    // let name = node.name
    // let $h3 = $('<h3>' + name)
    // let $content = $('<div class="content">')
    //
    // if (node.summary) {
    //     $out.append('<p>' + node.summary)
    // }
    //
    // if (isLeaf(node)) {
    //
    // } else {
    //     let $new = $('<ul class="accordion">')
    //     node.children.forEach((child, i) => {
    //         $new.append(htmlNodeLoader(node.children[i], $('<li>')))
    //     })
    //     $out.append($new)
    // }
    // $el.append($out)
    return $el
}

function loadAccordionHtml(elId) {
    return htmlNodeLoader(rawMap, $('#' + elId))
}

function render(elId) {
    let $el = loadAccordionHtml(elId)

    // $el.accordion()

    // $el.find("ul.accordion").accordion({
    //     collapsible: true,
    //     active: false,
    //     heightStyle: "content"
    // });
}

function researchMap(elId) {
    utils.loadHtml(html.default, 'research-map', () => {
        render(elId)
    })
}

window.BHTMS = {
    researchMap: researchMap
}
