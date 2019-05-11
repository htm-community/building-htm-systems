import React from 'react'
import Header from './Header'
import Head from 'next/head'
import PropTypes from 'prop-types'

import './layout.css'

const Layout = ({children}) => (
	<div className="body">
		<Head>
			<link href="/static/katex.min.css" rel="stylesheet" />
		</Head>
		<Header />
		{children}
	</div>
)

Layout.propTypes = {
	children: PropTypes.any
}

export default Layout
