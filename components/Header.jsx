import React from 'react'
import Link from 'next/link'
const Header = () => (

	<nav className="nav header">
		<Link href="/">
			<a className="nav-link active">Home</a>
		</Link>
		<Link href="/encoders">
			<a className="nav-link">Encoders</a>
		</Link>
		<Link href="/encoding-numbers">
			<a className="nav-link">Encoding Numbers</a>
		</Link>
		<Link href="/encoding-categories">
			<a className="nav-link">Encoding Categories</a>
		</Link>
		<Link href="/encoding-time">
			<a className="nav-link">Encoding Time</a>
		</Link>
		<Link href="/spatial-pooling">
			<a className="nav-link">Spatial Pooling</a>
		</Link>
		<Link href="/components-showcase">
			<a className="nav-link">Components Showcase</a>
		</Link>
	</nav>
)

export default Header
