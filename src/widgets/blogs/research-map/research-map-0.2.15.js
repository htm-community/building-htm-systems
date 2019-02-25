/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/lib/utils.js":
/*!**************************!*\
  !*** ./src/lib/utils.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// Loads given html into an element, calls the cb one time when loaded.\nfunction loadHtml(html, elementId, cb) {\n    let $el = $('#' + elementId);\n    $el.html(html).promise().done(cb);\n}\n\nfunction getRandomInt(max) {\n    return Math.floor(Math.random() * Math.floor(max));\n}\n\nfunction precisionRound(number, precision) {\n    let factor = Math.pow(10, precision);\n    return Math.round(number * factor) / factor;\n}\n\nfunction getRandomArbitrary(min, max) {\n    return Math.random() * (max - min) + min;\n}\n\nlet mod = function (a, b) {\n    return (a % b + b) % b;\n};\n\n// Standard Normal variate using Box-Muller transform.\nlet randomBoxMuller = function () {\n    let u = 0,\n        v = 0;\n    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)\n    while (v === 0) v = Math.random();\n    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);\n};\n\nfunction randomTorusWalk(d, w, h, speed) {\n    let X = [];\n    let V = [];\n    let x = [0.5 * w, 0.5 * h];\n\n    X.push(x.slice());\n    let v = [0.0, 0.0];\n    let theta = 0.0;\n\n    for (let t = 0; t < d; t++) {\n        theta += randomBoxMuller() / 4;\n        v[0] = speed * Math.cos(theta);\n        v[1] = speed * Math.sin(theta);\n        x[0] += v[0];\n        x[1] += v[1];\n        x[0] = mod(x[0], w);\n        x[1] = mod(x[1], h);\n        X.push(x.slice());\n        V.push(v.slice());\n    }\n    return [X, V];\n}\n\nmodule.exports = {\n    loadHtml: loadHtml,\n    getRandomInt: getRandomInt,\n    getRandomArbitrary: getRandomArbitrary,\n    precisionRound: precisionRound,\n    randomTorusWalk: randomTorusWalk\n};\n\n//# sourceURL=webpack:///./src/lib/utils.js?");

/***/ }),

/***/ "./src/widgets/blogs/research-map/index.js":
/*!*************************************************!*\
  !*** ./src/widgets/blogs/research-map/index.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("let utils = __webpack_require__(/*! ../../../lib/utils */ \"./src/lib/utils.js\");\nlet html = __webpack_require__(/*! ./index.tmpl.html */ \"./src/widgets/blogs/research-map/index.tmpl.html\");\nlet researchMap = __webpack_require__(/*! ./research-map.json */ \"./src/widgets/blogs/research-map/research-map.json\");\n// list of ids for open topics at any time, used to close topics during nav.\nlet open = [];\n\nlet $overlay;\nlet selectedTopicId;\n\nfunction getOffset(el) {\n    var _x = 0;\n    var _y = 0;\n    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {\n        _x += el.offsetLeft - el.scrollLeft;\n        _y += el.offsetTop - el.scrollTop;\n        el = el.offsetParent;\n    }\n    return { top: _y, left: _x };\n}\n\nfunction isChildMap(node) {\n    return !node.resources && !node.dependencies && !node.desc && !node.children;\n}\n\nfunction toDomId(str) {\n    return str.replace(/\\s+/g, '_').replace(/\\//g, '_');\n}\n\nfunction htmlOverlayNodeLoader(node, $el, selectedName, _name) {\n    // Read through hierarchy and create the HTML we need\n    // to support the overlay\n\n    let nodeName = node.name || _name || 'root';\n    let $header = $('<h3>');\n    let $content = $('<div>');\n    let id = toDomId(nodeName);\n\n    $header.attr('id', id);\n\n    if (isChildMap(node)) {\n        let childNames = Object.keys(node);\n        let $ul = $('<ul id=\"' + id + '\" class=\"accordion\">');\n        childNames.forEach(name => {\n            $ul.append(htmlOverlayNodeLoader(node[name], $('<li>'), selectedName, name));\n        });\n        $content.append($ul);\n    } else {\n\n        if (node.children) {\n            htmlOverlayNodeLoader(node.children, $content, selectedName, nodeName);\n        }\n\n        if (nodeName !== 'root') {\n            let $a = $('<a href=\"#\">');\n            $a.addClass('trigger');\n            $a.data('triggers', nodeName);\n            $a.html(nodeName);\n            $header.html($a);\n        }\n    }\n\n    $el.append([$header, $content]);\n\n    return $el;\n}\n\nfunction htmlAccordionNodeLoader(node, $el, _name) {\n    // Read through hierarchy and create the HTML we need\n    // to support the nested accordions\n\n    let nodeName = node.name || _name || 'root';\n    let $header = $('<h3>');\n    let $content = $('<div>');\n    let id = toDomId(nodeName);\n\n    if (isChildMap(node)) {\n        let childNames = Object.keys(node);\n        let $ul = $('<ul id=\"' + id + '\" class=\"accordion\">');\n        childNames.forEach(name => {\n            $ul.append(htmlAccordionNodeLoader(node[name], $('<li>'), name));\n        });\n        $content.append($ul);\n    } else {\n\n        $content.append($('<a class=\"overlay-trigger\" href=\"#\">Navigate</a>'));\n\n        $content.attr('id', id);\n        if (node.desc) {\n            $content.append(node.desc);\n        }\n\n        if (node.children) {\n            htmlAccordionNodeLoader(node.children, $content, nodeName);\n        }\n\n        if (nodeName && node.desc) {\n\n            if (node.resources) {\n                let $res = $('<ul>');\n                Object.keys(node.resources).forEach(resource => {\n                    let url = node.resources[resource];\n                    let $link = $('<a href=\"' + url + '\" target=\"_blank\">');\n                    $link.html(resource);\n                    let $li = $('<li>');\n                    $li.append($link);\n                    $res.append($li);\n                });\n                $content.append('<h4>External Resources');\n                $content.append($res);\n            }\n\n            if (node.dependencies) {\n                let $deps = $('<ul>');\n                node.dependencies.forEach(depName => {\n                    let $li = $('<li>');\n                    let $link = $('<a href=\"#\">');\n                    $link.addClass('trigger');\n                    $link.data('triggers', depName);\n                    $link.html(depName);\n                    $li.append($link);\n                    $deps.append($li);\n                });\n                $content.append('<h4>Related Topics');\n                $content.append($deps);\n            }\n        }\n\n        $header.html(nodeName);\n        $header.attr('id', toDomId(nodeName) + '_accordion');\n    }\n\n    $el.append([$header, $content]);\n\n    return $el;\n}\n\nfunction loadAccordionHtml($el) {\n    return htmlAccordionNodeLoader(researchMap, $el);\n}\n\nfunction loadOverlay() {\n    let $overlay = htmlOverlayNodeLoader(researchMap, $('#overlay-map'));\n    return $overlay;\n}\n\nfunction getMapAncestors(m, target, _crumbs, _name) {\n    let out = [];\n    let crumbs = _crumbs || [];\n    if (target === _name) {\n        out = out.concat(crumbs);\n        out.push(_name);\n    } else {\n        if (m.children) {\n            crumbs.push(_name);\n            out = out.concat(getMapAncestors(m.children, target, crumbs));\n        } else if (m.desc) {\n            // ignore leaf node\n        } else {\n            // root map of children\n            let ancestors = Object.keys(m).map(childName => {\n                return getMapAncestors(m[childName], target, crumbs, childName);\n            });\n            ancestors = [].concat.apply([], ancestors);\n            out = out.concat(ancestors);\n        }\n    }\n    return out;\n}\n\nfunction isAccordionOpen($a) {\n    return $a.hasClass('ui-state-active');\n}\n\nfunction closeAccordion($a) {\n    if (isAccordionOpen($a)) {\n        $a.click();\n    }\n}\n\nfunction closeAllOpen() {\n    open.reverse().forEach(id => {\n        let $a = $('#' + id + '_accordion');\n        closeAccordion($a);\n    });\n    open = [];\n}\n\nfunction showOverlay($trigger) {\n    let $accordion = $('.accordion-map');\n    // Get position of accordion and place overlay over top of it.\n    let topLeft = getOffset($accordion.get(0));\n    let parentWidth = $accordion.width();\n    let padPercent = .05;\n    let width = parentWidth * (1.0 - padPercent);\n    let padding = (parentWidth - width) / 2;\n    // Highlight the current location in the overlay\n    $overlay.find('.selected').removeClass('selected');\n    $overlay.find('#' + selectedTopicId).addClass('selected');\n    $overlay.width(width);\n    $overlay.css({\n        left: topLeft.left + padding,\n        top: getOffset($trigger.get(0)).top\n    });\n    $overlay.show('fast');\n    $accordion.fadeTo('fast', 0.5);\n}\n\nfunction render($topEl) {\n    let $el = loadAccordionHtml($topEl.find('.accordion-map'));\n\n    $overlay = loadOverlay();\n\n    $el.find(\"ul.accordion\").accordion({\n        collapsible: true,\n        active: false,\n        heightStyle: \"content\"\n    });\n\n    // This opens the main accordion\n    $el.find(\"#\" + toDomId(\"root\")).accordion({\n        collapsible: false,\n        active: true,\n        heightStyle: \"content\"\n    });\n\n    $topEl.click(evt => {\n        let $target = $(evt.target);\n        // If navigation click\n        $('#overlay-map').hide('fast');\n        $('.accordion-map').fadeTo('fast', 1.0);\n        if ($target.hasClass('trigger')) {\n            let targetName = $target.data('triggers');\n            let targetId = toDomId(targetName);\n            // Set this global state\n            selectedTopicId = targetId;\n            evt.stopPropagation();\n            evt.preventDefault();\n            closeAllOpen();\n            let ancestors = getMapAncestors(researchMap, targetName);\n            let ancestorIds = ancestors.map(toDomId);\n            ancestorIds.forEach(id => {\n                $('#' + id + '_accordion').click();\n                open.push(id);\n            });\n            $([document.documentElement, document.body]).animate({\n                scrollTop: $('#' + targetId).offset().top\n            }, 1000);\n        }\n        // If overlay trigger\n        if ($target.hasClass('overlay-trigger')) {\n            evt.stopPropagation();\n            evt.preventDefault();\n            showOverlay($target);\n        }\n    });\n}\n\nfunction processRequest(elId) {\n    utils.loadHtml(html.default, elId, () => {\n        render($('#' + elId));\n    });\n}\n\nwindow.BHTMS = {\n    researchMap: processRequest\n};\n\n//# sourceURL=webpack:///./src/widgets/blogs/research-map/index.js?");

/***/ }),

/***/ "./src/widgets/blogs/research-map/index.tmpl.html":
/*!********************************************************!*\
  !*** ./src/widgets/blogs/research-map/index.tmpl.html ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (`<div class=\"research-map\">\n  <div class=\"accordion-map\"></div>\n  <div id=\"overlay-map\"></div>\n</div>\n`);\n\n//# sourceURL=webpack:///./src/widgets/blogs/research-map/index.tmpl.html?");

/***/ }),

/***/ "./src/widgets/blogs/research-map/research-map.json":
/*!**********************************************************!*\
  !*** ./src/widgets/blogs/research-map/research-map.json ***!
  \**********************************************************/
/*! exports provided: Thousand Brains Theory of Intelligence, default */
/***/ (function(module) {

eval("module.exports = {\"Thousand Brains Theory of Intelligence\":{\"desc\":\"<img src=\\\"img/classic-hierarchy-vs-proposed-model.png\\\" /> <p> The <strong>Thousand Brains Theory of Intelligence</strong> proposes that rather than learning one model of an object or concept, the brain builds many models of the same thing. Each model is built in a different way – with different types of inputs from different senses or from different parts of the same sensors. The models vote together to reach a consensus on what they are sensing, and the consensus vote is what we perceive. It’s as if your brain is thousands of brains working simultaneously. </p> <p> The Thousand Brains Theory suggests we need to rethink how the cortex processes information.  Rather than extracting sensory features in a series of processing steps, where objects are recognized as you ascend the hierarchy, our theory suggests a more distributed model. </p>\\n\",\"resources\":{\"Thousand Brains Theory of Intelligence (blog post)\":\"https://numenta.com/blog/2019/01/16/the-thousand-brains-theory-of-intelligence/\",\"A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex (Research paper)\":\"https://numenta.com/neuroscience-research/research-publications/papers/a-framework-for-intelligence-and-cortical-function-based-on-grid-cells-in-the-neocortex/\",\"Companion to A Framework for Intelligence and Cortical Function (Companion paper for non-neuroscientists)\":\"https://numenta.com/neuroscience-research/research-publications/papers/thousand-brains-theory-of-intelligence-companion-paper/\"},\"children\":{\"Local Computations / Parallel Voting\":{\"desc\":\"<img src=\\\"img/parallel-voting.png\\\" /> <p> In the Thousand Brains Theory, each cortical column creates complete models of its world, based on what it can sense as its associated sensor moves. Columns combine sensory input with a grid cell-derived location, and then integrate those “sensory features at locations” over movements. Long-range connections in the cortex allow columns to vote and this parallel voting leads to a consensus of what they the columns are sensing. </p>\\n\",\"resources\":{\"A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex (Research paper)\":\"https://numenta.com/neuroscience-research/research-publications/papers/a-framework-for-intelligence-and-cortical-function-based-on-grid-cells-in-the-neocortex/\",\"Locations in the Neocortex\":\"A Theory of Sensorimotor Object Recognition Using Cortical Grid Cells (Research paper): https://numenta.com/neuroscience-research/research-publications/papers/locations-in-the-neocortex-a-theory-of-sensorimotor-object-recognition-using-cortical-grid-cells/\"}},\"Common Cortical Circuit\":{\"desc\":\"<img src=\\\"img/cortical-circuit.png\\\" /> <p> The neocortex is complex. It contains dozens of cell types, numerous layers, and intricate connectivity patterns. The connections between cells suggest a columnar flow of information across layers as well as a laminar flow within some layers. Fortunately, this complex circuitry is remarkably preserved in all regions. Vernon Mountcastle was the first to propose that a canonical circuit consisting of cortical columns underlies everything the neocortex does. The way we see, feel, hear, move, and even do high level planning runs on this same common cortical circuit. </p>\\n<p> If we can understand how this <strong>common cortical circuit</strong> works, we will have a framework for understanding how the entire neocortex works. Understanding the function of cortical columns is a central goal of our research program. </p>\\n\",\"resources\":{\"Cortical Circuitry (HTM School)\":\"https://www.youtube.com/watch?v=mPFx9yuV1Os\"},\"children\":{\"Layers\":{\"desc\":\"<img src=\\\"img/layers.png\\\" /> <p> While neuroscience textbooks generally list 6 <strong>layers</strong> in the neocortex, scientists now believe there are more, with dozens of different cell types.  Our work involves figuring out what each layer is doing and how it fits into the common cortical circuit. </p>\\n\",\"resources\":{\"Cortical Circuitry (HTM School)\":\"https://www.youtube.com/watch?v=mPFx9yuV1Os\"}},\"Connections Between Layers\":{\"desc\":\"<img src=\\\"img/connections-between-layers.png\\\" /> <p> As part of the common cortical circuit, the layers relate to each other in specific ways. Through our research, we are mapping out these connections. </p>\\n\",\"resources\":{\"Cortical Circuitry (HTM School)\":\"https://www.youtube.com/watch?v=mPFx9yuV1Os\"}},\"HTM Neuron\":{\"desc\":\"<img src=\\\"img/htm-neuron.png\\\" /> <p> Much of our research focuses around one fundamental observation: that the neocortex is constantly predicting its inputs. The <strong>HTM neuron</strong> is based on the idea that every pyramidal cell is a prediction machine. A single pyramidal neuron with active dendrites can recognize hundreds of unique patterns and contexts in which it can predict its input. </p>\\n\"},\"Minicolumns\":{\"desc\":\"<p> Minicolumns, also sometimes referred to as cortical columns, are the most basic unit of neural organization.  It is the building block of essential elements for cortical processing. </p>\\n\",\"resources\":{\"Why Neurons Have Thousands of Synapses, A Theory of Sequence Memory in Neocortex (Research paper)\":\"https://numenta.com/neuroscience-research/research-publications/papers/why-neurons-have-thousands-of-synapses-theory-of-sequence-memory-in-neocortex/\"}},\"Sequence Memory\":{\"desc\":\"<img src=\\\"img/sequence-memory.png\\\" /> <p> A network incorporating such neurons can learn complex sequences in a surprisingly robust and flexible manner. The model learns in a completely unsupervised fashion and, as a continuously learning system, adapts rapidly to changes in its input. </p>\\n\",\"resources\":{\"Why Neurons Have Thousands of Synapses, A Theory of Sequence Memory in Neocortex (Research paper)\":\"https://numenta.com/neuroscience-research/research-publications/papers/why-neurons-have-thousands-of-synapses-theory-of-sequence-memory-in-neocortex/\"}}}},\"Complete Object Modeling\":{\"desc\":\"\",\"children\":{\"Locations\":{\"desc\":\"<img src=\\\"img/locations.png\\\" /> <p> We propose that the neocortex learns the structure of objects in the same way that the entorhinal cortex and hippocampus learn the structure of environments.  Every sensation we perceive is processed relative to its <strong>location</strong> on an object, not relative to you.  Columns combine sensory input with that feature’s location, and integrate those “sensory features at locations” over movements. </p>\\n\",\"resources\":{\"A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex (Research paper)\":\"https://numenta.com/neuroscience-research/research-publications/papers/a-framework-for-intelligence-and-cortical-function-based-on-grid-cells-in-the-neocortex/\",\"Locations in the Neocortex\":\"A Theory of Sensorimotor Object Recognition Using Cortical Grid Cells (Research paper): https://numenta.com/neuroscience-research/research-publications/papers/locations-in-the-neocortex-a-theory-of-sensorimotor-object-recognition-using-cortical-grid-cells/\"}},\"Grid Cells\":{\"desc\":\"<img src=\\\"img/grid-cells.png\\\" /> <p> A <strong>grid cell</strong> is a type of neuron that exists in the entorhinal cortex and is responsible for navigation and knowing where you are in the world. Recent experimental evidence suggests that grid cells also are present in the neocortex. We propose that the neocortex uses “<strong>cortical grid cells</strong>” to learn complete models of objects in the same way that the entorhinal cortex uses <strong>grid cells</strong> to learn the structure of environments. </p>\\n\",\"resources\":{\"A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex (Research paper)\":\"https://numenta.com/neuroscience-research/research-publications/papers/a-framework-for-intelligence-and-cortical-function-based-on-grid-cells-in-the-neocortex/\",\"Locations in the Neocortex\":\"A Theory of Sensorimotor Object Recognition Using Cortical Grid Cells (Research paper): https://numenta.com/neuroscience-research/research-publications/papers/locations-in-the-neocortex-a-theory-of-sensorimotor-object-recognition-using-cortical-grid-cells/\",\"Grid Cells (HTM School Episode)\":\"https://www.youtube.com/watch?v=mP7neeymcUY\"}},\"Displacement Cells\":{\"desc\":\"<img src=\\\"img/displacement-cells.png\\\" /> <p> We propose the existence of a new type of neuron that is an extension of grid cells, called <strong>displacement cells</strong>. Displacement cells enable us to learn how objects are composed of other objects, also known as object compositionality. </p>\\n\",\"resources\":{\"A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex (Research paper)\":\"https://numenta.com/neuroscience-research/research-publications/papers/a-framework-for-intelligence-and-cortical-function-based-on-grid-cells-in-the-neocortex/\",\"Locations in the Neocortex\":\"A Theory of Sensorimotor Object Recognition Using Cortical Grid Cells (Research paper): https://numenta.com/neuroscience-research/research-publications/papers/locations-in-the-neocortex-a-theory-of-sensorimotor-object-recognition-using-cortical-grid-cells/\"}},\"Object Compositionality\":{\"desc\":\"<img src=\\\"img/object-compositionality.png\\\" /> <p> Almost everything we know is composed of other things we already have learned, which allows the brain to learn new things efficiently without constantly having to learn everything from scratch. We propose that every time you learn a new object, displacement cells enable your brain to represent that object as a collection of objects you’ve previously learned, arranged in a particular way. </p>\\n\",\"resources\":{\"A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex (Research paper)\":\"https://numenta.com/neuroscience-research/research-publications/papers/a-framework-for-intelligence-and-cortical-function-based-on-grid-cells-in-the-neocortex/\",\"Locations in the Neocortex\":\"A Theory of Sensorimotor Object Recognition Using Cortical Grid Cells (Research paper): https://numenta.com/neuroscience-research/research-publications/papers/locations-in-the-neocortex-a-theory-of-sensorimotor-object-recognition-using-cortical-grid-cells/\"}},\"Object Behavior\":{\"desc\":\"<img src=\\\"img/object-behavior.png\\\" /> <p> We propose that learning an <strong>object’s behavior<strong> is learning a sequence of displacements, meaning a sequence of how the relative positions of two locations change over time. </p>\\n\",\"resources\":{\"A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex (Research paper)\":\"https://numenta.com/neuroscience-research/research-publications/papers/a-framework-for-intelligence-and-cortical-function-based-on-grid-cells-in-the-neocortex/\",\"Locations in the Neocortex\":\"A Theory of Sensorimotor Object Recognition Using Cortical Grid Cells (Research paper): https://numenta.com/neuroscience-research/research-publications/papers/locations-in-the-neocortex-a-theory-of-sensorimotor-object-recognition-using-cortical-grid-cells/\"}}}},\"Abstract Objects and Concepts\":{\"desc\":\"\\n<p> Mountcastle proposed that all regions of the neocortex have the same complex circuitry and therefore they must be doing the same thing. If the regions of the neocortex that process sensory input use grid cells and locations to learn objects, then the evidence strongly suggests that the regions of the neocortex that learn <strong>abstract objects and concepts</strong> like language or mathematics also use grid cells and locations to perform these functions. </p>\\n<p> We don’t fully understand how high-level concepts and abstract objects are represented in the brain, and are exploring this area further. </p>\\n\",\"resources\":{\"A Framework for Intelligence and Cortical Function Based on Grid Cells in the Neocortex (Research paper)\":\"https://numenta.com/neuroscience-research/research-publications/papers/a-framework-for-intelligence-and-cortical-function-based-on-grid-cells-in-the-neocortex/\",\"Locations in the Neocortex\":\"A Theory of Sensorimotor Object Recognition Using Cortical Grid Cells (Research paper): https://numenta.com/neuroscience-research/research-publications/papers/locations-in-the-neocortex-a-theory-of-sensorimotor-object-recognition-using-cortical-grid-cells/\"}}}}};\n\n//# sourceURL=webpack:///./src/widgets/blogs/research-map/research-map.json?");

/***/ }),

/***/ 0:
/*!*******************************************************!*\
  !*** multi ./src/widgets/blogs/research-map/index.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = __webpack_require__(/*! ./src/widgets/blogs/research-map/index.js */\"./src/widgets/blogs/research-map/index.js\");\n\n\n//# sourceURL=webpack:///multi_./src/widgets/blogs/research-map/index.js?");

/***/ })

/******/ });