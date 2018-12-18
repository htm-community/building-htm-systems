let utils = require('../../../lib/utils')
let html = require('./index.tmpl.html')
let YAML = require('yamljs')
let researchMap = YAML.load('./research-map.yaml')


function isChildMap(node) {
    return !node.resources && !node.requires && !node.desc && !node.children
}

function toDomId(str) {
    return str.replace(/\s+/g, '_')
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

        $content.attr('id', id)
        if (node.desc) {
            $content.append(node.desc)
        }

        if (node.children) {
            htmlNodeLoader(node.children, $content, nodeName)
        }

        if (nodeName && node.desc) {

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

            if (node.requires) {
                let $res = $('<ul>')
                node.requires.forEach(req => {
                    let $link = $('<a class="requires" href="#">')
                    $link.html(req)
                    let $li = $('<li>')
                    $li.append($link)
                    $res.append($li)
                })
                $content.append('<h4>Required Reading')
                $content.append($res)
            }
        }

        if (nodeName !== 'root') {
            $header.html(nodeName)
            $header.attr('id', toDomId(nodeName) + '_h3')
        }
    }

    $el.append([$header, $content])

    return $el
}

function loadAccordionHtml(elId) {
    return htmlNodeLoader(researchMap, $('#' + elId))
}

function render(elId) {
    let $el = loadAccordionHtml(elId)

    $el.find("ul.accordion").accordion({
        collapsible: true,
        active: false,
        heightStyle: "content"
    });

    // This opens the main accordion
    $el.find("#" + toDomId("root")).accordion({
        collapsible: false,
        active: true,
        heightStyle: "content"
    })

    // Inter-accordion clicks
    $el.find('.requires').click(evt => {
        let id = toDomId($(evt.target).html())
        evt.stopPropagation()
        evt.preventDefault()
        $('#' + id + '_h3').click()
    })
}

function processRequest(elId) {
    utils.loadHtml(html.default, 'research-map', () => {
        render(elId)
    })
}

window.BHTMS = {
    researchMap: processRequest
}
