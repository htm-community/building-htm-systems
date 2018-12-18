let utils = require('../../../lib/utils')
let html = require('./prototype_2.tmpl.html')
let YAML = require('yamljs')
let rawMap = YAML.load('./research-map.yaml')

function isChildMap(node) {
    return !node.resources && !node.requires && !node.desc && !node.children
}

function toDomId(str) {
    return str.replace(/\s+/, '_')
}

function htmlNodeLoader(node, $el, _name) {
    // Read through hierarchy and create the HTML we need
    // to support the nested accordions

    let $header = $('<h3>')
    let $content = $('<div>')

    let nodeName = (node.name || _name) || 'root'
    let id = toDomId(nodeName)

    if (isChildMap(node)) {
        let childNames = Object.keys(node)
        let $ul = $('<ul id="' + id + '" class="accordion">')
        childNames.forEach(name => {
            $ul.append(htmlNodeLoader(node[name], $('<li>'), name))
        })
        $content.append($ul)
    } else {


        if (node.desc) {
            $content.append(node.desc)
        }

        if (node.children) {
            htmlNodeLoader(node.children, $content, nodeName)
        }

        if (node.resources) {
            let $res = $('<ul>')
            Object.keys(node.resources).forEach(resource => {
                let url = node.resources[resource]
                let $link = $('<a href="' + url + '" target="_blank">')
                $link.html(resource)
                let $li = $('<li>')
                $li.append($link)
                $res.append($li)
            })
            $content.append('<h4>Other Resources')
            $content.append($res)
        }

        if (nodeName !== 'root')
            $header.html(nodeName)


    }

    $el.append([$header, $content])

    return $el
}

function loadAccordionHtml(elId) {
    return htmlNodeLoader(rawMap, $('#' + elId))
}

function render(elId) {
    let $el = loadAccordionHtml(elId)

    $el.find("ul.accordion").accordion({
        collapsible: true,
        active: false,
        heightStyle: "content"
    });

    $el.find("#" + toDomId("root")).accordion({
        collapsible: false,
        active: true,
        heightStyle: "content"
    })
}

function researchMap(elId) {
    utils.loadHtml(html.default, 'research-map', () => {
        render(elId)
    })
}

window.BHTMS = {
    researchMap: researchMap
}
