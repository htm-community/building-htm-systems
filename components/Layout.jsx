import React from 'react'
import Header from './Header'
import Head from 'next/head'
import PropTypes from 'prop-types'

import './layout.css'

const Layout = ({ children }) => (
  <div className="body">
    <Head>
      <link href="/static/katex.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"></link>
    </Head>
    <Header />
    {children}
  </div>
)

Layout.propTypes = {
  children: PropTypes.any
}

export default Layout
