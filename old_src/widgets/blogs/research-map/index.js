let utils = require('../../../lib/utils')
let html = require('./index.tmpl.html')
let researchMap = require('./research-map.json')
// list of ids for open topics at any time, used to close topics during nav.
let open = []

let $overlay
let selectedTopicId

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}

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

    $header.attr('id', id)

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

function updateImageSizes($el) {
    $el.find('img').each((i, img) => {
        let $img = $(img)
        let h = $img.height()
        let w = $img.width()
        if (h > 0 && w > 0) {
            console.log('found image: %s', $img.attr('src'))
        }
        if (h > w) {
            $img.addClass('half')
        }
        $img.show()
    })
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

        $content.append($('<a class="overlay-trigger" href="#">Navigate</a>'))

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

function getMapAncestors(m, target, _crumbs, _name) {
    let out = []
    let crumbs = _crumbs || []
    if (target === _name) {
        out = out.concat(crumbs)
        out.push(_name)
    } else {
        if (m.children) {
            crumbs.push(_name)
            out = out.concat(
                getMapAncestors(
                    m.children,
                    target,
                    crumbs
                )
            )
        } else if (m.desc) {
            // ignore leaf node
        } else {
            // root map of children
            let ancestors = Object.keys(m).map(childName => {
                return getMapAncestors(
                    m[childName], target, crumbs, childName
                )
            })
            ancestors = [].concat.apply([], ancestors);
            out = out.concat(ancestors)
        }
    }
    return out
}

function isAccordionOpen($a) {
    return $a.hasClass('ui-state-active')
}

function closeAccordion($a) {
    if (isAccordionOpen($a)) {
        $a.click()
    }
}

function closeAllOpen() {
    open.reverse().forEach(id => {
        let $a = $('#' + id + '_accordion')
        closeAccordion($a)
    })
    open = []
}

function showOverlay($trigger) {
    let $accordion = $('.accordion-map')
    // Get position of accordion and place overlay over top of it.
    let topLeft = getOffset($accordion.get(0))
    let parentWidth = $accordion.width()
    let padPercent = .05
    let width = parentWidth * (1.0 - padPercent)
    let padding = (parentWidth - width) / 2
    // Highlight the current location in the overlay
    $overlay.find('.selected').removeClass('selected')
    $overlay.find('#' + selectedTopicId).addClass('selected')
    $overlay.width(width)
    $overlay.css({
      left: topLeft.left + padding,
      top: getOffset($trigger.get(0)).top,
    })
    $overlay.show('fast')
    $accordion.fadeTo('fast', 0.5)
}

function render($topEl) {
    let $accordion = htmlAccordionNodeLoader(
        researchMap, $topEl.find('.accordion-map')
    )

    $overlay = htmlOverlayNodeLoader(
        researchMap, $('#overlay-map')
    )

    let accordionOpened = function(evt) {
        updateImageSizes($accordion)
        let targetId = evt.target.id
        console.log(`accordion opened: ${targetId}`)

        if (selectedTopicId === targetId) {
            console.log(`scrolling to ${selectedTopicId}...`)
            $([document.documentElement, document.body]).animate({
                scrollTop: $('#' + selectedTopicId).offset().top - 40
            }, 1000, () => {
                console.log(`done scrolling, deleting ${selectedTopicId}...`)
                selectedTopicId = undefined
            });
        }

    }

    $accordion.find("ul.accordion").accordion({
        collapsible: true,
        active: false,
        heightStyle: "content",
        activate: accordionOpened,
    });

    // This opens the main accordion
    $accordion.find("#" + toDomId("root")).accordion({
        collapsible: false,
        active: true,
        heightStyle: "content",
    })

    $topEl.click(evt => {
        let $target = $(evt.target)
        // If navigation click
        $('#overlay-map').hide('fast')
        $('.accordion-map').fadeTo('fast', 1.0)

        console.log($target)

        if ($target.hasClass('trigger')) {
            // This applies only to the navigation overlay.
            // Navigation happens here on clicks.
            let targetName = $target.data('triggers')
            let targetId = toDomId(targetName)
            // Set this global state
            selectedTopicId = targetId
            evt.stopPropagation()
            evt.preventDefault()
            closeAllOpen()
            let ancestors = getMapAncestors(researchMap, targetName)
            let ancestorIds = ancestors.map(toDomId)
            ancestorIds.forEach(id => {
                $('#' + id + '_accordion').click()
                open.push(id)
            })
        } else {
            // This applies to manual clicking anywhere over the accordion space
            if ($target.hasClass('ui-accordion-header')) {
                let parts = $target.attr('id').split('_')
                let id = parts.slice(0, parts.length - 1).join('_')
                // Set this global state
                selectedTopicId = id
            }
        }

        // If overlay trigger
        if ($target.hasClass('overlay-trigger')) {
            evt.stopPropagation()
            evt.preventDefault()
            showOverlay($target)
        }

        console.log(`selectedTopic: ${selectedTopicId}`)
    })
}

function renderResearchMap(elId) {
    utils.loadHtml(html.default, elId, () => {
        render($('#' + elId))
    })
}

window.BHTMS = {
    researchMap: renderResearchMap
}
