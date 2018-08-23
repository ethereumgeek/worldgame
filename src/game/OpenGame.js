import React, { Component } from 'react';
import './OpenGame.css';
import './Common.css';

class OpenGame extends Component {
    constructor(props) {
        super(props);
        this.state = {
          inputGameId: ""
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.openGame = this.openGame.bind(this);
    }

    handleInputChange(event) {
        let newValue = event.target.value;        
        newValue = newValue.replace(/[^0-9]/gi, '');
        this.setState({inputGameId: newValue});
    }

    openGame(event) {
        this.props.onOpenGame(this.state.inputGameId);
    }

    render() {
        return (
            <div className="inputContainer">
                <div className="groupTitle">Open existing game</div>
                <input disabled={false} autoComplete="off" placeholder={"Game id"} type="text" className="inputBox" name="gameid" value={this.state.inputGameId} onChange={this.handleInputChange} />
                <button onClick={this.openGame} className="btn">Open game</button>
            </div>
        );
    }
  }
  
  export default OpenGame;