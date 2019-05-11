import React from 'react'
import PropTypes from 'prop-types'

const DiagramStub = ({id}) => (
	<h3 id={id}>
      Diagram Stub "{id}"
	</h3>
)

DiagramStub.propTypes = {
	id: PropTypes.string.isRequired,
}

export default DiagramStub
