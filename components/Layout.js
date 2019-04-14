import Header from './Header'
import Head from 'next/head'

const layoutStyle = {
  margin: 20,
  padding: 20,
  border: '1px solid #DDD',
  fontFamily: 'Verdana',
}

const Layout = props => (
  <div style={layoutStyle}>
    <Head>
      <link href="/static/katex.min.css" rel="stylesheet" />
    </Head>
    <Header />
    {props.children}
  </div>
)

export default Layout
