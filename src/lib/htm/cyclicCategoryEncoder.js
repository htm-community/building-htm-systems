class CyclicCategoryEncoder {

    constructor(opts) {
        this.buckets = opts.buckets
        this.range = opts.range
        this.bits = opts.bits
        this.scale = d3.scaleLinear()
            .domain([0, this.buckets])
            .range([0, this.bits])
    }

    encode(value) {
        let bits = this.bits
        let out = []
        if (value >= this.buckets) {
            throw new Error('Cannot encode value outside bucket range: ' + value)
        }
        d3.range(0, this.bits).forEach(() => { out.push(0) })
        let index = Math.round(this.scale(value))
        out[index] = 1
        let flip = false
        let step = 0
        for (let i = 1; i < this.range; i++) {
            let move = step + 1
            if (flip) {
                move = -move
                step++
            }
            let bitIndex = index + move
            // Adjust for out of range, by cycling around
            if (bitIndex >= bits) bitIndex = bitIndex - bits
            if (bitIndex < 0) bitIndex = bitIndex + bits
            if (bitIndex > bits-1) {
                throw new Error('CyclicCategoryEncoder attempted to store bits out of range!')
            }
            out[bitIndex] = 1
            flip = ! flip
        }
        let validated = 0
        function isValid(bit) {
            validated++
            return bit === 0 || bit === 1
        }

        // Old checks I left in just in case and also because I didn't write unit tests.
        if (! out.every(isValid) || validated !== out.length) {
            throw new Error('CyclicCategoryEncoder created non-continuous output!')
        }
        if (out.length > this.bits) {
            throw new Error('CyclicCategoryEncoder created output of the wrong length!')
        }

        return out
    }
}

module.exports = CyclicCategoryEncoder
