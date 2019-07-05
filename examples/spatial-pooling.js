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

const codeExampleTwo = `const pools = getPotentialPools()
const allPerms = []
// Permanence arrays match the potential pool
pools.forEach(pool => {
	const perms = []
	pool.forEach(_ => {
		let perm = randomBates()
		// Permence must be between 0 and 1
		if (perm > 1) perm = 1
		if (perm < 0) perm = 0
		perms.push(perm)
	})
	allPerms.push(perms)
})
return allPerms
`

module.exports = {
	code: [
		codeExampleOne,
		codeExampleTwo,
	]
}
