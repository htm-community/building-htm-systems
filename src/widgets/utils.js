// Loads given html into an element, calls the cb one time when loaded.
function loadHtml(html, elementId, cb) {
    let $el = $('#' + elementId)
    $el.html(html).promise().done(cb)
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function precisionRound(number, precision) {
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

let mod = function (a, b) {
    return ((a % b) + b) % b;
}

// Standard Normal variate using Box-Muller transform.
let randomBoxMuller = function() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function randomTorusWalk(d, w, h, speed) {
    let X = []
    let V = []
    let x = [0.5*w, 0.5*h]

    X.push(x.slice())
    let v = [0.0,0.0]
    let theta = 0.0

    for (let t=0; t<d; t++) {
        theta += randomBoxMuller()/4
        v[0] = speed*Math.cos(theta)
        v[1] = speed*Math.sin(theta)
        x[0] += v[0]
        x[1] += v[1]
        x[0] = mod(x[0],w)
        x[1] = mod(x[1],h)
        X.push(x.slice())
        V.push(v.slice())
    }
    return [X,V]
}


module.exports = {
    loadHtml: loadHtml,
    getRandomInt: getRandomInt,
    getRandomArbitrary: getRandomArbitrary,
    precisionRound: precisionRound,
    randomTorusWalk: randomTorusWalk,
}
