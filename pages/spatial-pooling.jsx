import React from 'react'
import Layout from '../components/Layout'
import withScalarData from '../hoc/withScalarData';


class SpatialPooling extends React.Component {

	componentDidMount() {
		this.props.startData();
	}

	render() {
		return (
			<div>
				<Layout>
					<h2>Spatial Pooling</h2>
					
					{JSON.stringify(this.props.data)}

				</Layout>
			</div>
		)
	}

}
 export default withScalarData({ updateRate: 1000 })(SpatialPooling)
