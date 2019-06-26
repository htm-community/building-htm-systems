import React, { Component } from 'react'
import Play from './Play'
import Pause from './Pause'

// thanks: https://gist.github.com/tchardin/ed551c191c5869092128b93fa8705b98

class Player extends Component {

	constructor(props) {
		super(props)
		this.state = {
			playing: false
		}
	}

	handlePlayerClick = () => {
		if (!this.state.playing) {
			this.setState({ playing: true })
		} else {
			this.setState({ playing: false })
		}
		this.props.onUpdate(this.state.playing)
	}

	render() {
		return (
			<div className="player" >
				{this.state.playing ? <Pause onPlayerClick={this.handlePlayerClick} /> : <Play onPlayerClick={this.handlePlayerClick} />}
			</div>
		)
	}
}

export default Player
