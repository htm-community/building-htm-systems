let utils = require('../../../lib/utils')
let html = require('./prototype_2.tmpl.html')
let YAML = require('yamljs')
let rawMap = YAML.load('./research-map.yaml')
let firstRendered = true

function htmlNodeLoader(node, $el, _name) {
    // Read through hierarchy and create the HTML we need
    // to support the nested accordions

    let $header = $('<h3>')
    let $content = $('<div>')

    let nodeName = (_name || node.name)

    if (node.desc) {
        $content.append('<p class="desc">' + node.desc)
    }

    if (! nodeName) {
        let childNames = Object.keys(node)
        let clazz = "accordion "
        if (firstRendered) {
            clazz += "top"
            firstRendered = false
        } else {
            clazz += "below"
        }
        let $ul = $('<ul class="' + clazz + '">')
        childNames.forEach((name, i) => {
            $ul.append(htmlNodeLoader(node[name], $('<li>'), name))
        })
        $content.append($ul)
    } else if (node.children) {
        $content.append(htmlNodeLoader(node.children, $content))
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

    $header.html(nodeName)

    $el.append([$header, $content])
    return $el
}

function loadAccordionHtml(elId) {
    return htmlNodeLoader(rawMap, $('#' + elId))
}

function render(elId) {
    let $el = loadAccordionHtml(elId)
    $el.find("ul.accordion.below").accordion({
        collapsible: true,
        active: false,
        heightStyle: "content"
    });

    $el.find("ul.accordion.first").accordion({
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
