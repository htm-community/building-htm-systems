let utils = require('../../widgets/utils')
let html = require('./firingFields.tmpl.html')
let JSDS = require('JSDS')
let FiringPatch = require('./firingPatch')

//
// colors for... [[ background, agent, big circle, small circle ]]
//
let colors = [
    ["rgba(0, 0, 0, 1.0)", "rgba(255, 255, 255, 1.0)", "rgba(255,   0,   0, 0.01)", "rgba(255, 0, 0, 1.0)" ],
    ["rgba(0, 0, 0, 1.0)", "rgba(255, 255, 255, 1.0)", "rgba(55, 255, 255, 0.01)", "rgba(55, 255, 255, 1.0)" ],
    ["rgba(255, 255, 255, 1.0)", "rgba(0, 0, 0, 1.0)", "rgba(55, 0, 255, 0.01)", "rgba(55, 0, 255, 1.0)" ],
    ["rgba(255, 255, 255, 1.0)", "rgba(0, 0, 0, 1.0)", "rgba(255, 0, 0, 0.01)", "rgba(255, 0, 0, 1.0)" ]
]

let jsds = JSDS.create('grid-cell-firing-fields')

let mod = function (a, b) {
    return ((a % b) + b) % b;
};

if(!Number.prototype.mod) {
    Number.prototype.mod = function (b) {
        return ((this % b) + b) % b;
    };
}

let bind = function(that, f) {
    return function() {
        return f.apply(that, arguments);
    }
};

if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}

let extractMousePosition = function(e) {
    let posx = 0;
    let posy = 0;
    if (!e) e = window.event;
    if (e.pageX || e.pageY) 	{
        posx = e.pageX;
        posy = e.pageY;
    }
    else if (e.clientX || e.clientY) 	{
        posx = e.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop
            + document.documentElement.scrollTop;
    }
    return [posx, posy];
}

let Stage = function (canvasElement) {
    let canvas = canvasElement;
    let ctx = canvas.getContext('2d');

    this.size = function() {
        return [canvas.width, canvas.height]
    }

    this.pixel = function(position, color) {
        ctx.fillStyle = color;
        ctx.fillRect(position[0], position[1], 2, 2);
    };

    this.rect = function(position, size, color) {
        ctx.fillStyle = color;
        ctx.fillRect(position[0], position[1], size[0], size[1]);
    };

    this.circle = function(position, radius, color) {
        ctx.fillStyle = color;
        hidden_ctx.beginPath();
        hidden_ctx.arc(position[0],position[1],radius,0,2*Math.PI);
        hidden_ctx.fill();
    };

    this.clear = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    this.imshow= function(imagedata) {
        ctx.putImageData(imageata, 0, 0)
    }
};

let makeObservable = function (obj) {
    let callbacks =  {};

    obj.on =  function (type, f) {
        (callbacks[type] = callbacks[type] || []).push(f);
        return obj;
    };

    obj.fire = function (type, data) {
        let args = [].slice.call(arguments, 1);
        (callbacks[type] || []).map(function (f) {
            f.apply(obj, args || null);
        });

        (callbacks["any"] || []).map(function (f) {
            f.apply(obj, [type].concat(args) );
        });
        return obj;
    };

    obj.fireMany = function (events) {
        let that = this;
        events.map(function (args) {
            that.fire.apply(that, args);
        });
    };

    obj.onAny = function (f) {
        (callbacks["any"] = callbacks["any"] || []).push(f);
        return obj;
    };

    return obj;
}


let beep = (function () {
    let context = new AudioContext()
    let o = new OscillatorNode(context)
    let g = context.createGain()
    o.connect(g)
    g.connect(context.destination)
    o.connect(g)
    g.connect(context.destination)
    o.start(0)
    g.gain.linearRampToValueAtTime(0, context.currentTime)

    return function () {
        g.gain.linearRampToValueAtTime(1, context.currentTime);
        g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.04);
        g.gain.linearRampToValueAtTime(0, context.currentTime + 0.4);}
})()


let create_firing_field = function(B, v, num_fields, r) {
    let [w,h] = num_fields
    let firing_field = []

    w = parseInt(w/2)
    h = parseInt(h/2)
    for (let x=-w; x<w; x++) {
        for (let y=-h; y<h; y++) {
            cx = x*B[0][0] + y*B[0][1] + v[0]
            cy = x*B[1][0] + y*B[1][1] + v[1]
            patch = new FiringPatch({
                "id"    : [ x, y],
                "center": [cx,cy],
                "radius": r})
            firing_field.push(patch)
        }
    }
    return firing_field
};


// Standard Normal variate using Box-Muller transform.
let randn_bm = function() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

let random_torus_walk = function(d, w, h, speed) {
    let X = []
    let V = []

    let x = [0.5*w, 0.5*h]

    X.push(x.slice())
    let v = [0.0,0.0]
    let theta = 0.0

    for (let t=0; t<d; t++) {
        theta += randn_bm()/4
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

function redraw($el, data, currentLocation) {

    let keys = Object.keys(data)

    function treatCircle(points, key, radius, color) {
        points.attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', radius)
            .attr('fill', color)
    }

    for (let key of keys) {
        let $dotGroup = $el.select('g#group-' + key + ' g.dots')
        let $fuzzGroup = $el.select('g#group-' + key + ' g.fuzz')

        // Update
        let $dots = $dotGroup.selectAll('circle')
            .data(data[key])
        treatCircle($dots, key, 1, colors[key][3])
        let $fuzz = $fuzzGroup.selectAll('circle')
            .data(data[key])
        treatCircle($fuzz, key, 10, colors[key][2])

        // Enter
        let $newDots = $dots.enter().append('circle')
        treatCircle($newDots, key, 1, colors[key][3])
        let $newFuzz = $fuzz.enter().append('circle')
        treatCircle($newFuzz, key, 10, colors[key][2])
        // Exit
        $dots.exit().remove()
        $fuzz.exit().remove()
    }

    $el.select('#current-location')
        .attr('cx', currentLocation.x)
        .attr('cy', currentLocation.y)
        .attr('r', 10)
        .attr('stroke', 'red')
        .attr('stroke-width', '2px')
        .attr('fill', 'none')

}

function prepSvg($svg, keys) {
    $svg.attr('width', 300)
        .attr('height', 300)

    let $gcGroups = $svg.selectAll('g.grid-cell')
        .data(keys)
        .enter()
        .append('g')
        .attr('id', key => 'group-' + key)
        .attr('class', 'grid-cell')

    $gcGroups.append('g').attr('class', 'dots')
    $gcGroups.append('g').attr('class', 'fuzz')
}

function goSvg(elId) {
    let $svg = d3.select('#' + elId + ' svg')

    prepSvg($svg, ["0", "1", "2"])

    jsds.after('set', 'spikes', () => {
        redraw($svg, jsds.get('spikes'), jsds.get('currentLocation'))
    })
}

module.exports = (elId) => {

    utils.loadHtml(html.default, elId, () => {

        let $speedSlider = $('#speed')

        let w = 300
        let h = 300

        let zeros = function (dimensions) {
            let array = [];

            for (let i = 0; i < dimensions[0]; ++i) {
                array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
            }

            return array;
        };


        let t=0;
        let grid_cells = []

        let d = 1000000
        let [X,V] = random_torus_walk(d, w, h, 2.0)
        let speed = parseInt($speedSlider.val())

        let mx = X[t][0];
        let my = X[t][1];


        let theta = 1.43
        let c = 110
        grid_cells.push(create_firing_field(
            [
                [c*Math.cos(theta), c*Math.cos(theta + Math.PI/3.0)],
                [c*Math.sin(theta), c*Math.sin(theta + Math.PI/3.0)]
            ],
            [0, 0],
            [20, 20],
            60
        ))

        theta = 0.43
        c = 115
        grid_cells.push(create_firing_field(
            [
                [c*Math.cos(theta), c*Math.cos(theta + Math.PI/3.0)],
                [c*Math.sin(theta), c*Math.sin(theta + Math.PI/3.0)]
            ],
            [10, 0],
            [20, 20],
            70
        ))


        grid_cells.push(create_firing_field(
            [
                [100,   0],
                [  0, 100]
            ],
            [150, 150],
            [20, 20],
            100
        ))

        jsds.set('gridCells', grid_cells)

        function updateLocation(x, y) {
            let loc = {x: x, y: y}
            jsds.set('currentLocation', loc)

            for (var gcId =0; gcId < grid_cells.length; gcId++) {
                let gc_id = gcId.toString()
                let gcStore = jsds.get('spikes.' + gc_id) || []
                for (let f of grid_cells[gcId]) {
                    if(f.spike([x,y])) {
                        gcStore.push(loc)
                        // beep()
                    }
                }
                if (gcStore.length) {
                    let key = 'spikes.' + gc_id.toString()
                    jsds.set(key, gcStore)
                }
            }

            t+= 1
        }

        function startTimer(speed) {
            // If speed is larger than .5 second, we'll assume they just want to stop.
            if (speed >= 500) speed = 99999999
            return setInterval(() => {
                mx = X[t%d][0];
                my = X[t%d][1];
                updateLocation(mx, my)
            }, speed)
        }

        goSvg(elId)

        $speedSlider.on('input', () => {
            clearInterval(timerHandle)
            let speed = parseInt($speedSlider.val())
            console.log(speed)
            timerHandle = startTimer(speed)
        })

        let timerHandle = startTimer(speed)

    })

}


