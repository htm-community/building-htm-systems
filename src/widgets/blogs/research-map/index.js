let utils = require('../../../lib/utils')
let html = require('./index.tmpl.html')
let researchMap = require('./research-map.json')


function isChildMap(node) {
    return !node.resources && !node.dependencies && !node.desc && !node.children
}

function toDomId(str) {
    return str.replace(/\s+/g, '_')
              .replace(/\//g, '_')
}

function htmlOverlayNodeLoader(node, $el, selectedName, _name) {
    // Read through hierarchy and create the HTML we need
    // to support the overlay

    let nodeName = node.name || _name || 'root'
    let $header = $('<h3>')
    let $content = $('<div>')
    let id = toDomId(nodeName)

    if (isChildMap(node)) {
        let childNames = Object.keys(node)
        let $ul = $('<ul id="' + id + '" class="accordion">')
        childNames.forEach(name => {
            $ul.append(htmlOverlayNodeLoader(node[name], $('<li>'), selectedName, name))
        })
        $content.append($ul)
    } else {

        if (node.children) {
            htmlOverlayNodeLoader(node.children, $content, selectedName, nodeName)
        }

        if (nodeName !== 'root') {
            let $a = $('<a href="#">')
            $a.addClass('trigger')
            $a.data('triggers', nodeName)
            $a.html(nodeName)
            $header.html($a)
        }
    }

    $el.append([$header, $content])

    return $el
}

function htmlAccordionNodeLoader(node, $el, _name) {
    // Read through hierarchy and create the HTML we need
    // to support the nested accordions

    let nodeName = node.name || _name || 'root'
    let $header = $('<h3>')
    let $content = $('<div>')
    let id = toDomId(nodeName)

    if (isChildMap(node)) {
        let childNames = Object.keys(node)
        let $ul = $('<ul id="' + id + '" class="accordion">')
        childNames.forEach(name => {
            $ul.append(htmlAccordionNodeLoader(node[name], $('<li>'), name))
        })
        $content.append($ul)
    } else {

        $content.append($('<a class="overlay-trigger" href="#">where am I?</a>'))

        $content.attr('id', id)
        if (node.desc) {
            $content.append(node.desc)
        }

        if (node.children) {
            htmlAccordionNodeLoader(node.children, $content, nodeName)
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
                $content.append('<h4>External Resources')
                $content.append($res)
            }

            if (node.dependencies) {
                let $deps = $('<ul>')
                node.dependencies.forEach(depName => {
                    let $li = $('<li>')
                    let $link = $('<a href="#">')
                    $link.addClass('trigger')
                    $link.data('triggers', depName)
                    $link.html(depName)
                    $li.append($link)
                    $deps.append($li)
                })
                $content.append('<h4>Related Topics')
                $content.append($deps)
            }
        }

        $header.html(nodeName)
        $header.attr('id', toDomId(nodeName) + '_accordion')
    }

    $el.append([$header, $content])

    return $el
}

function loadAccordionHtml($el) {
    return htmlAccordionNodeLoader(researchMap, $el)
}

function loadOverlay(selectedName) {
    let $overlay = htmlOverlayNodeLoader(researchMap, $('.overlay-map'), selectedName)
    return $overlay
}

function getMapAncestors(m, target, _crumbs, _name) {
    let out = []
    let crumbs = _crumbs || []
    if (target === currentNodeName) {
        out.concat(crumbs)
    }
    if (m.children) {
        crumbs.push(_name)
        out.concat(
            getMapAncestors(
                m.children,
                target,
                crumbs
            )
        )
    } else if (m.desc) {
        // leaf node
        
    } else {
        // root map of children
        Object.keys(m).forEach(childName => {
            out.concat(getMapAncestors(
                m[childName], target, crumbs, childName
            ))
        })
    }
    return out
}


function render($topEl) {
    let $el = loadAccordionHtml($topEl.find('.accordion-map'))

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

    $topEl.click(evt => {
        let $target = $(evt.target)
        // If manual accordion click
        if ($target.hasClass('trigger')) {
            let targetName = $target.data('triggers')
            evt.stopPropagation()
            evt.preventDefault()
            let ancestors = getMapAncestors(researchMap, targetName)
            ancestors.forEach(ancestor => {
                $('#' + ancestor + '_accordion').click()
            })
        }
        // If overlay trigger
        if ($target.hasClass('overlay-trigger')) {
            loadOverlay()
        }
    })

}

function processRequest(elId) {
    utils.loadHtml(html.default, elId, () => {
        render($('#' + elId))
    })
}

window.BHTMS = {
    researchMap: processRequest
}
