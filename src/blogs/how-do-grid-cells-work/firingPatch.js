let dist = function(a, b) {
    return  Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2)
}

class FiringPatch {

    constructor(params) {
        this.id     = params.id
        this.center = params.center
        this.radius = params.radius
    }

    prob(p) {
        let c = this.center;
        let r = this.radius;
        let d = dist(p, c);

        if (d < r) return Math.exp(- (d^2)/10.);
        else return 0;
    }

    spike(p) {
        return Math.random() < this.prob(p);
    }

    getId() {
        return this.id.toString()
    }
}


module.exports = FiringPatch
