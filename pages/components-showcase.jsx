import React from 'react'
import Layout from '../components/Layout'
import CodeSyntax from '../components/CodeSyntax'


const codeBlockContents =
`const CategoryEncoder = require('./category')


class WeekendEncoder extends CategoryEncoder {

    constructor(opts) {
        super({
            w: opts.w,
            categories: ['weekday', 'weekend'],
        })
    }

    encode(date) {
        let dayOfWeek = date.getDay()
        let value = 'weekday'
        if (dayOfWeek === 0 || dayOfWeek === 6)
            value ='weekend'
        return super.encode(value)
    }

}

module.exports = WeekendEncoder
`
const highlightedLines = [5,6,8,10]

export default function EncodingCategories() {
	return (
		<div>
			<Layout>
				<h2>Components Showcase</h2>
				<i>This page demoes the available components for creating tutorials</i>
				<h3>Code block</h3>
				<CodeSyntax highlightedLines={highlightedLines}>{codeBlockContents}</CodeSyntax>
			</Layout>
		</div>
	)
}
