import React from 'react';


const withScalarData = (props) => (WrappedComponent) => {
  class withScalarDataHoc extends React.Component {

		state = {
			data: {
				value: undefined,
				time: undefined,
			}
		}
        
		counter = undefined
		timeMarker = undefined
		intervalHandle = undefined

		start() {
			this.stop();
			this.counter = 0
			this.timeMarker = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
			this.intervalHandle = setInterval(() => this.nextSemiRandomSineWaveDataPoint(), props.updateRate)
		}

		nextSemiRandomSineWaveDataPoint() {
			const timeStep = 60 * 60000 // minutes
			const slicesPerPeriod = 24
			const period = 2 * Math.PI
			const dataStep = period / slicesPerPeriod // radians
			let value = Math.sin(this.counter)
			this.counter += dataStep
			const min = -0.5
			const max = 0.5
			const jitter = Math.random() * (max - min) + min
			if (Math.random() > 0.5) {
				value = value + jitter
			}
			this.timeMarker = new Date(this.timeMarker.getTime() + timeStep)
			// I could add artificial temporal patterns here.
			let periods = 0
			if (this.counter > periods * period) periods++
			// Like this. I'll make every 3rd cycle different
			if (periods % 3 ===0) {
					value = Math.abs(value*1.5)
			}
			this.setState({ data : {
				value: value,
				time: this.timeMarker,
			}})
		
		}

		stop() {
			clearInterval(this.intervalHandle)
		}

    render() {
      return (
        <WrappedComponent
          {...this.props}
          data={this.state.data}
          startData={() => this.start()}
          stopData={() => this.stop()}
        />
      );
    }
  }
    
  return withScalarDataHoc;
};

export default withScalarData;
