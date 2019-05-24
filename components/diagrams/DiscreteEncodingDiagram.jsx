import ScalarOverlap from './ScalarOverlapDiagram'
import PropTypes from 'prop-types'
import simplehtm from 'simplehtm'

const CategoryEncoder = simplehtm.encoders.CategoryEncoder

class DiscreteEncodingDiagram extends ScalarOverlap {

	resetEncoder() {
		const {
			categoryLength, w
		} = this.props
		this.encoder = new CategoryEncoder({
			w: w, categories: [...Array(categoryLength).keys()]
		})
		this.encodingA = this.encoder.encode(this.valueA)
		this.encodingB = this.encoder.encode(this.valueB)
	}

}

DiscreteEncodingDiagram.propTypes = {
	w: PropTypes.number.isRequired,
	categoryLength: PropTypes.number.isRequired,
}

export default DiscreteEncodingDiagram
