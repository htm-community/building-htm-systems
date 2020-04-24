import * as d3 from 'd3';
import React from 'react';

class DiagramLegend extends React.Component {

	componentDidMount() {
        this.root = d3.select(`svg#${this.props.id}`)

        let groupYCoord = 0
        this.props.legendData.forEach((legendData)=>{
            let group = this.root.append('g');
                group.attr('transform', `translate(0, ${groupYCoord})`)
                    .append('rect')
                    .attr('style', `fontSize: 15px; stroke-width: 1; stroke: #808080; fill: ${legendData.fillColor}; `)
                    .attr('width', 15)
                    .attr('height', 15)
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('r', 6)

                group.append('text')
                    .text(legendData.label)
                    .attr('alignment-baseline', 'middle')
                    .attr('x', 25)
                    .attr('y', 8.5)
                if(legendData.marker){
                    group.append('text')
                        .text(legendData.marker)
                        .attr('style', `fontSize: 15px; fill: ${legendData.markerFillColor}; `)
                        .attr('x', 2.5)
                        .attr('y', 12.5)
                        // console.log("Marker exists for ", legendData.label );
                }

            groupYCoord+=25;
        })

	}

	render() {
		return (
            <svg style={{...this.props.style}} id={this.props.id}></svg>
		)
	}
}


export default DiagramLegend;