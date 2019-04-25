import Header from './Header'
import Head from 'next/head'

import './layout.css'

const Layout = props => (
  <div className="body">
    <Head>
      <link href="/static/katex.min.css" rel="stylesheet" />
    </Head>
    <Header />
    {props.children}
  </div>
)

export default Layout
