import React, { Component } from 'react';
import './OpenGame.css';
import './Common.css';

class OpenGame extends Component {
    constructor(props) {
        super(props);
        this.state = {
          inputGameId: "",
          invalid: false
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.openGame = this.openGame.bind(this);
    }

    componentDidMount() {
        this.setState({invalid: false});
    }

    handleInputChange(event) {
        let newValue = event.target.value;        
        newValue = newValue.replace(/[^0-9]/gi, '');
        this.setState({inputGameId: newValue, invalid: false});
    }

    openGame(event) {
        if (
            this.state.inputGameId !== "" && 
            parseInt(this.state.inputGameId, 10) >= 0 && 
            parseInt(this.state.inputGameId, 10) < parseInt(this.props.gameCount, 10)
        ) {
            this.props.onOpenGame(this.state.inputGameId);
        }
        else {
            this.setState({invalid: true});
        }
      }

    render() {
        return (
            <div className="inputContainer">
                <div className="groupTitle">Open existing game</div>
                {this.props.gameCount}
                <input disabled={false} autoComplete="off" placeholder={"Game id"} type="text" className="inputBox" name="gameid" value={this.state.inputGameId} onChange={this.handleInputChange} />
                {this.state.invalid && (<div className="errorMsg">Invalid game id</div>)}
                <button onClick={this.openGame} className="btn">Open game</button>
            </div>
        );
    }
  }
  
  export default OpenGame;