import React from 'react'
import Link from 'next/link'
import './header.css'

const linkStyle = {
	marginRight: 15
}

const Header = () => (
	<div className="header">
		<Link href="/">
			<a style={linkStyle}>Home</a>
		</Link>
		<Link href="/encoders">
			<a style={linkStyle}>Encoders</a>
		</Link>
		<Link href="/encoding-numbers">
			<a style={linkStyle}>Encoding Numbers</a>
		</Link>
		<Link href="/encoding-categories">
			<a style={linkStyle}>Encoding Categories</a>
		</Link>
		<Link href="/encoding-time">
			<a style={linkStyle}>Encoding Time</a>
		</Link>
		<Link href="/components-showcase">
			<a style={linkStyle}>Components Showcase</a>
		</Link>
	</div>
)

export default Header
