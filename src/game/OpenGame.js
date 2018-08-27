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
        this.openGameById = this.openGameById.bind(this);
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

    openGameById(event, gameId) {
        if (
            parseInt(gameId, 10) >= 0 && 
            parseInt(gameId, 10) < parseInt(this.props.gameCount, 10)
        ) {
            this.props.onOpenGame(gameId);
        }
    }

    createGame(event) {
        this.props.onSelectPage("create");
    }

    render() {

        let yourGameLinks = [];
        if (this.props.gamesForAddressList && this.props.gamesForAddressList.length > 0) {
            for (let i = 0; i < this.props.gamesForAddressList.length; i++) {
                let gameId = parseInt(this.props.gamesForAddressList[i], 10);
                yourGameLinks.push(
                    <div key={i} style={{marginTop:5}}><span className="linkSpan" onClick={(event) => this.openGameById(event, gameId)}>Game #{gameId}</span></div>
                );
            }
        }
        else {
            yourGameLinks.push(
                <div key="create" style={{marginTop:5}}><span className="linkSpan" onClick={(event) => this.createGame(event)}>No recent games.  Click to create a new game.</span></div>
            );
        }

        let gameLinks = [];
        if (this.props.gameCount > 0) {
            for (let i = this.props.gameCount - 1; i >= 0 && i + 10 > this.props.gameCount; i--) {
                gameLinks.push(
                    <div key={i} style={{marginTop:5}}><span className="linkSpan" onClick={(event) => this.openGameById(event, i)}>Game #{i}</span></div>
                );
            }
        }
        else {
            gameLinks.push(
                <div key="create" style={{marginTop:5}}><span className="linkSpan" onClick={(event) => this.createGame(event)}>No existing games.  Click to create a new game.</span></div>
            );
        }

        return (
            <div>
                <div className="menuGap"></div>
                <div className="inputContainer">
                    <div className="groupTitle">Your recent games</div>
                    {yourGameLinks}

                    <div className="groupTitle titleMargin">All recently created games</div>
                    {gameLinks}
                    <div className="groupTitle titleMargin">Load a game by id</div>
                    <input disabled={false} autoComplete="off" placeholder={"Game id"} type="text" className="inputBox" name="gameid" value={this.state.inputGameId} onChange={this.handleInputChange} />
                    {this.state.invalid && (<div className="errorMsg">Invalid game id</div>)}
                    <button onClick={this.openGame} className="btn">Open game</button>
                </div>
            </div>
        );
    }
  }
  
  export default OpenGame;