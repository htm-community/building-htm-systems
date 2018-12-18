let utils = require('../../../lib/utils')
let html = require('./index.tmpl.html')

// Optionally load from YAML file, which is better source format.
// let YAML = require('yamljs')
// let researchMap = YAML.load('./research-map.yaml')

let researchMap = {
    "1000 Brains": {
        "desc": "<p> The Thousand Brains Model of Intelligence suggests we need to rethink how the entire neocortex processes information. In the classic view, the cortex receives input from a sensory organ and processes it in a series of hierarchical steps. Sensory input ascends from region to region, and at each level, cells respond to larger areas and more complex features of a sensory array. It’s commonly assumed that complete objects can only be recognized at a high enough level in the hierarchy where cells can take in the entire sensory array. </p>\n",
        "resources": {
            "Intro to Thousand Brains Model of Intelligence": "https://numenta.com/blog/2018/03/19/thousand-brains-model-of-intelligence/"
        },
        "children": {
            "Local Computations / Parallel Voting": {
                "desc": "<p> In the Thousand Brains Model of Intelligence, each column creates complete models of its world, based on what it can sense as its associated sensor moves. Connections in the cortex, both hierarchical connections and connections between adjacent columns, allow columns to work together to quickly identify objects. </p>\n",
                "resources": {
                    "A Theory of How Columns in the Neocortex Enable Learning the Structure of the World": "https://numenta.com/neuroscience-research/research-publications/papers/a-theory-of-how-columns-in-the-neocortex-enable-learning-the-structure-of-the-world/",
                    "A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex": "https://numenta.com/neuroscience-research/research-publications/papers/a-framework-for-intelligence-and-cortical-function-based-on-grid-cells-in-the-neocortex/",
                    "Companion paper to A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex": "https://numenta.com/neuroscience-research/research-publications/papers/thousand-brains-theory-of-intelligence-companion-paper/"
                }
            },
            "Common Cortical Circuit": {
                "desc": "\n<p>Introduction to Common Cortical Circuit</p>\n",
                "children": {
                    "Layers": {
                        "desc": "\n<p>Layers Summary Text</p>\n",
                        "resources": {
                            "A Theory of How Columns in the Neocortex Enable Learning the Structure of the World": "https://numenta.com/neuroscience-research/research-publications/papers/a-theory-of-how-columns-in-the-neocortex-enable-learning-the-structure-of-the-world/",
                            "Locations in the Neocortex, A Theory of Sensorimotor Object Recognition Using Cortical Grid Cells\"": "https://numenta.com/neuroscience-research/research-publications/papers/locations-in-the-neocortex-a-theory-of-sensorimotor-object-recognition-using-cortical-grid-cells/"
                        }
                    },
                    "Connections Between Layers": {
                        "desc": "\n<p>Connections Between Layers Summary Text</p>\n",
                        "requires": [
                            "Layers"
                        ],
                        "resources": {
                            "Thalamus Snubbed": "https://numenta.com/blog/2018/08/29/thalamus-snubbed/"
                        }
                    },
                    "HTM Neuron": {
                        "desc": "\n<p>HTM Neuron summary</p>\n",
                        "resources": {
                            "Why Neurons Have Thousands of Synapses, A Theory of Sequence Memory in Neocortex": "https://numenta.com/neuroscience-research/research-publications/papers/why-neurons-have-thousands-of-synapses-theory-of-sequence-memory-in-neocortex/"
                        }
                    },
                    "Minicolumns": {
                        "desc": "\n<p>Minicolumns summary</p>\n",
                        "requires": [
                            "HTM Neuron"
                        ],
                        "resources": {
                            "Why Neurons Have Thousands of Synapses, A Theory of Sequence Memory in Neocortex": "https://numenta.com/neuroscience-research/research-publications/papers/why-neurons-have-thousands-of-synapses-theory-of-sequence-memory-in-neocortex/",
                            "HTM School Spatial Pooling Part 1": "https://www.youtube.com/watch?v=R5UoFNtv5AU",
                            "HTM School Spatial Pooling Part 2": "https://www.youtube.com/watch?v=rHvjykCIrZM"
                        }
                    },
                    "Sequence Memory": {
                        "desc": "\n<p>Summary of sequence memory</p>\n",
                        "requires": [
                            "Minicolumns",
                            "HTM Neuron"
                        ],
                        "resources": {
                            "Why Neurons Have Thousands of Synapses, A Theory of Sequence Memory in Neocortex": "https://numenta.com/neuroscience-research/research-publications/papers/why-neurons-have-thousands-of-synapses-theory-of-sequence-memory-in-neocortex/",
                            "HTM School Temporal Memory Part 1": "https://www.youtube.com/watch?v=UBzemKcUoOk",
                            "HTM School Temporal Memory Part 2": "https://www.youtube.com/watch?v=1OhY_u3NjdM"
                        }
                    }
                }
            },
            "Complete Object Modeling": {
                "desc": "\n<p>every CC models a complete object</p>\n",
                "children": {
                    "Locations": {
                        "desc": "\n<p>Why we need to model location spaces around objects.</p>\n"
                    },
                    "Grid Cells": {
                        "desc": "\n<p>Introduction to Grid Cells</p>\n",
                        "resources": {
                            "Locations in the Neocortex, A Theory of Sensorimotor Object Recognition Using Cortical Grid Cells\"": "https://numenta.com/neuroscience-research/research-publications/papers/locations-in-the-neocortex-a-theory-of-sensorimotor-object-recognition-using-cortical-grid-cells/",
                            "Grid Cells HTM School": "https://www.youtube.com/watch?v=mP7neeymcUY",
                            "How Grid Cells Map Space": "https://numenta.com/blog/2018/05/25/how-grid-cells-map-space/"
                        }
                    },
                    "Displacement Cells": {
                        "desc": "\n<p>Introduction to Displacement Cells</p>\n",
                        "resources": {
                            "Locations in the Neocortex, A Theory of Sensorimotor Object Recognition Using Cortical Grid Cells\"": "https://numenta.com/neuroscience-research/research-publications/papers/locations-in-the-neocortex-a-theory-of-sensorimotor-object-recognition-using-cortical-grid-cells/",
                            "A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex": "https://numenta.com/neuroscience-research/research-publications/papers/a-framework-for-intelligence-and-cortical-function-based-on-grid-cells-in-the-neocortex/",
                            "Companion paper to A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex": "https://numenta.com/neuroscience-research/research-publications/papers/thousand-brains-theory-of-intelligence-companion-paper/"
                        },
                        "requires": [
                            "Grid Cells"
                        ]
                    },
                    "Composite Objects": {
                        "desc": "\n<p>Introduction to Composite Objects</p>\n",
                        "resources": {
                            "A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex": "https://numenta.com/neuroscience-research/research-publications/papers/a-framework-for-intelligence-and-cortical-function-based-on-grid-cells-in-the-neocortex/",
                            "Companion paper to A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex": "https://numenta.com/neuroscience-research/research-publications/papers/thousand-brains-theory-of-intelligence-companion-paper/"
                        },
                        "requires": [
                            "Grid Cells",
                            "Displacement Cells"
                        ]
                    },
                    "Object Behavior": {
                        "desc": "\n<p>Introduction to Object Behavior</p>\n",
                        "resources": {
                            "A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex": "https://numenta.com/neuroscience-research/research-publications/papers/a-framework-for-intelligence-and-cortical-function-based-on-grid-cells-in-the-neocortex/",
                            "Companion paper to A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex": "https://numenta.com/neuroscience-research/research-publications/papers/thousand-brains-theory-of-intelligence-companion-paper/"
                        },
                        "requires": [
                            "Grid Cells",
                            "Displacement Cells",
                            "Composite Objects"
                        ]
                    }
                }
            },
            "Abstract Objects": {
                "desc": "\n<p>Introduction to Abstract Objects</p>\n",
                "resources": {
                    "A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex": "https://numenta.com/neuroscience-research/research-publications/papers/a-framework-for-intelligence-and-cortical-function-based-on-grid-cells-in-the-neocortex/",
                    "Companion paper to A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex": "https://numenta.com/neuroscience-research/research-publications/papers/thousand-brains-theory-of-intelligence-companion-paper/"
                }
            }
        }
    }
}

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
