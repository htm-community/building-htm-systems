const codeExampleOne = `let pools = []
for (let i = 0; i < minicolumnCount; i++) {
	let pool = []
	for (let inputIndex = 0; inputIndex < inputCount; inputIndex++) {
		if (Math.random() < connectedPercent) {
			pool.push(inputIndex)
		}
	}
	pools.push(pool)
}
return pools
`

module.exports = {
	code: [
		codeExampleOne,
	]
}
