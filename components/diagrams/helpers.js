import * as d3 from 'd3'

export const precisionRound = (number, precision) => {
	const factor = Math.pow(10, precision)
	return Math.round(number * factor) / factor
}

export const lineFunction = d3.line()
	.x(function(d) { return d.x })
	.y(function(d) { return d.y })
	.curve(d3.curveCatmullRom.alpha(0.5))