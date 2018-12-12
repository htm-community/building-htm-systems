let utils = require('../../../lib/utils')
let html = require('./researchMap.tmpl.html')
let YAML = require('yamljs')
let rawMap = YAML.load('./research-map.yaml')
let selected = '1000 Brains'
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
                out = extractNode(name, children)
                if (out) {
                    out.parent = map[topicName]
                    out.parent.name = topicName
                }
            }
        })
    }
    return out
}

function renderContent(node) {
    if (node.desc) {
        $content.html(node.desc)
    }
    if (node.resources) {
        $content.append('<h3>Resources:')
        let $res = $('<ul class="resources">')
        Object.keys(node.resources).forEach(name => {
            let url = node.resources[name]
            $res.append(
                '<li><a href="' + url + '">' + name + '</a></li>'
            )
        })
        $content.append($res)
    }
    if (node.children) {
        $content.append('<h3>Explore:')
        let $res = $('<ul class="children topics">')
        Object.keys(node.children).forEach(name => {
            $res.append('<li class="topic">' + name)
        })
        $content.append($res)
    }
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
    console.log(toSelect)
    console.log(node)
}

function setupListeners() {
    $el.on('mousemove', (evt => {
        // console.log(evt.target)
        if ($(evt.target).hasClass('topic')) {
            if (evt.target.innerHTML) {
                renderResearchMap(evt.target.innerHTML)
            }
        }
    }))
}

function researchMap(elId) {
    utils.loadHtml(html.default, 'research-map', () => {
        $el = $('#' + elId)
        $ul = $el.find('ul.topics')
        $content = $el.find('.topic-content')
        renderResearchMap(selected)
        setupListeners()
    })
}

window.BHTMS = {
    researchMap: researchMap,
    JSDS: require('JSDS'),
}
