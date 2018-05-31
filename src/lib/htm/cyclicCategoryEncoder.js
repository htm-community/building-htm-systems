class CyclicCategoryEncoder {

    constructor(min, max, range, bits) {
        this.min = min
        this.max = max
        this.range = range
        this.bits = bits
        this.scale = d3.scaleLinear()
            .domain([min, max])
            .range([0, bits])
    }

    encode(value) {
        let out = []
        d3.range(0, this.bits).forEach(() => { out.push(0) })
        let index = this.scale(value)
        out[index] = 1
        for (let i = 0; i < this.range; i++) {
            let rangeIndex = index + i
            if (rangeIndex > out.length) {
                rangeIndex -= out.length
            }
            out[rangeIndex] = 1
        }
        return out
    }
}

module.exports = CyclicCategoryEncoder
