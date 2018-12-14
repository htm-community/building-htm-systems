let utils = require('../../../lib/utils')
let html = require('./prototype_1.tmpl.html')
let YAML = require('yamljs')
let rawMap = YAML.load('./research-map.yaml')
let selected
let $el, $ul, $content

function extractNode(name, map) {
    // console.log('extracting %s', name)
    let out
    if (map[name]) {
        out = map[name]
        out.name = name
    } else {
        let topics = Object.keys(map)
        topics.forEach(topicName => {
            let children = map[topicName].children
            if (children) {
                let match = extractNode(name, children)
                if (match) {
                    out = match
                    if (out.parent === undefined) {
                        out.parent = map[topicName]
                        out.parent.name = topicName
                    }
                }
            }
        })
    }
    return out
}

function renderContent(node) {
    $content.fadeOut(100, () => {
        if (node.desc) {
            $content.html(node.desc)
        }
        if (node.requires) {
            let $req = $('<ul class="requires">')
            node.requires.forEach(req => {
                $req.append('<li class="child-topic">' + req)
            })
            $content.append('<h5>Required Reading:')
            $content.append($req)
        }
        if (node.resources) {
            $content.append('<h5>Resources:')
            let $res = $('<ul class="resources">')
            Object.keys(node.resources).forEach(name => {
                let url = node.resources[name]
                $res.append(
                    '<li><a target="_blank" href="' + url + '">' + name + '</a></li>'
                )
            })
            $content.append($res)
        }
        if (node.children && node.name !== '1000 Brains') {
            $content.append('<h5>Explore:')
            let $res = $('<ul>')
            Object.keys(node.children).forEach(name => {
                $res.append('<li class="child-topic">' + name)
            })
            $content.append($res)
        }
        $content.fadeIn(100)
    })
}

function renderResearchMap(toSelect) {
    console.log('selecting %s', toSelect)
    let node = extractNode(toSelect, rawMap)
    // Clear list
    $ul.html('')
    // Display up node
    let parentName = node.name
    if (node.parent) {
        parentName = node.parent.name
        console.log('parent: %s', parentName)
    }
    let clazz = 'up '
    if (parentName === toSelect) {
        clazz += 'selected'
    }
    $ul.append('<li class="' + clazz + '">' + parentName)
    // Display sibling nodes
    let siblings = node.parent ? node.parent.children : node.children
    Object.keys(siblings).forEach(key => {
        let clazz = 'topic '
        if (key === toSelect) {
            clazz += 'selected'
        }
        $ul.append('<li class="' + clazz + '">' + key)
    })
    renderContent(node)
}

function setupListeners() {
    $el.on('mousemove', (evt => {
        let $tgt = $(evt.target);
        let newSelection = evt.target.innerHTML

        if ($tgt.hasClass('topic')) {
            if (evt.target.innerHTML) {
                if (newSelection === selected) {
                    evt.stopPropagation()
                } else {
                    selected = newSelection
                    renderResearchMap(evt.target.innerHTML)
                }
            }
        } else if ($tgt.hasClass('child-topic')) {
            $('.child-topic').removeClass('selected')
            $tgt.addClass('selected')
        } else if ($tgt.hasClass('up')) {
            $('.topic').removeClass('selected')
            $tgt.addClass('selected')
            if (newSelection === selected) {
                evt.stopPropagation()
            } else {
                selected = newSelection
                renderContent(extractNode(evt.target.innerHTML, rawMap))
            }
        }
    }))
    $el.on('click', (evt => {
        let $tgt = $(evt.target);
        if ($tgt.hasClass('child-topic') || $tgt.hasClass('topic') || $tgt.hasClass('up')) {
            renderResearchMap(evt.target.innerHTML)
        }
    }))
}

function researchMap(elId) {
    utils.loadHtml(html.default, 'research-map', () => {
        $el = $('#' + elId)
        $ul = $el.find('ul.topics')
        $content = $el.find('.topic-content')
        renderResearchMap('1000 Brains')
        setupListeners()
    })
}

window.BHTMS = {
    researchMap: researchMap,
    JSDS: require('JSDS'),
}
