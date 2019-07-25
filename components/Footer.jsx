import React from 'react'
import Link from 'next/link'
const Footer = () => (

	<nav className="nav footer">
		<Link href="/">
			<a className="nav-link active">Home</a>
		</Link>
		<Link href="https://numenta.com">
			<a className="nav-link active">Numenta.com</a>
		</Link>
		<Link href="https://discourse.numenta.org">
			<a className="nav-link active">HTM Forum</a>
		</Link>
		<Link href="https://www.youtube.com/NumentaTheory">
			<a className="nav-link active">YouTube</a>
		</Link>
	</nav>
)

export default Footer
