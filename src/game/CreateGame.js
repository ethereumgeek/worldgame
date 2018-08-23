import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { increasePlayerCount, reducePlayerCount, updateInput, updateValidation, startNewGame } from './CreateGameActions';
import { openGame } from './MenuActions';
import './CreateGame.css';
import './Common.css';

class CreateGame extends Component {
    constructor(props, context) {
        super(props)

        // This binding is necessary to make `this` work in the callback
        this.handleInputChange = this.handleInputChange.bind(this);
        this.increasePlayerCount = this.increasePlayerCount.bind(this);
        this.reducePlayerCount = this.reducePlayerCount.bind(this);
        this.startNewGame = this.startNewGame.bind(this);
        this.openGame = this.openGame.bind(this);
    }

    componentDidMount() {
        let { eth } = this.context.drizzle.web3;
        let { selectedAddress = "" } = eth.currentProvider.publicConfigStore.getState();

        this.props.dispatch(updateInput(
            "player1", 
            selectedAddress
        ));
    }

    componentWillUnmount() {
    }

    handleInputChange(event) {
        this.props.dispatch(updateInput(
            event.target.getAttribute("name"), 
            event.target.value
        ));
    }

    increasePlayerCount(event) {
        this.props.dispatch(increasePlayerCount());
    }

    reducePlayerCount(event) {
        this.props.dispatch(reducePlayerCount());
    }

    openGame(event, gameId) {
        console.log("Open game: " + gameId);
        this.props.dispatch(openGame(gameId));
    }

    startNewGame(event) {

        let { utils } = this.context.drizzle.web3;
        let playerMap = {};
        let validationMap = {};

        let { input, playerCount } = this.props.createGame;
        let validAddresses = true;
        for (let i = 1; i <= playerCount; i++) {
            let playerVal = input["player" + i] || "";

            if (
                playerVal === "" || 
                !utils.isAddress(playerVal) || 
                playerMap.hasOwnProperty(playerVal.toLowerCase())
            ) {
                validAddresses = false;
                validationMap["player" + i] = false;
            }
            else {
                playerMap[playerVal.toLowerCase()] = true;
                validationMap["player" + i] = true;
            }
        }

        if (validAddresses) {
            this.props.dispatch(startNewGame(this.context.drizzle, playerCount, input));
        }
        else {
            this.props.dispatch(updateValidation(validationMap));
        }
    }

    render() {

      let { input, playerCount, validationMap, pendingNewGame } = this.props.createGame;

      let playerAddressInputs = [];
      for (let i = 1; i <= playerCount; i++) {
          let playerVal = input["player" + i] || "";
          let notValid = validationMap.hasOwnProperty("player" + i) && validationMap["player" + i] === false;
          playerAddressInputs.push(<input key={i} disabled={false} autoComplete="off" placeholder={"Player " + i} type="text" className={"inputBox" + (notValid ? " notValid" : "")} name={"player" + i} value={playerVal} onChange={this.handleInputChange} />);
      }

      let txHash = null;
      let txStatus = "";
      let gameId = "";
      if (pendingNewGame !== null) {
          let state = this.context.drizzle.store.getState();  

          if (state.transactionStack[pendingNewGame]) {
              txHash = state.transactionStack[pendingNewGame]
              txStatus = state.transactions[txHash].status;

              if (txStatus === "success") {
                  let events = state.transactions[txHash].receipt.events;
                  gameId = events.NewGame.returnValues.gameId;
              }
          }
      }

  
      return (
          <div>
              <div className="inputContainer">
                  <div className="groupTitle groupMargin">Create a new game</div>
                  {txHash === null ? (
                      <div>
                        {playerAddressInputs}
                        <button className="btn" onClick={this.increasePlayerCount}>+ Add player</button>
                        <button className="btn" onClick={this.reducePlayerCount}>- Remove player</button>
                        <button className="btn" onClick={this.startNewGame}>Start new game</button>
                      </div>
                  ) : (
                      <div className="pendingGameMsg">
                          {
                              txStatus === "success" ? 
                              (<span className="linkSpan" onClick={(event) => this.openGame(event, gameId)}>New game created with id #{gameId}</span>) : 
                              (<span>Initializing new game ...</span>)
                          }
                      </div>
                  )}

              </div>
          </div>
      )
    }
}

CreateGame.contextTypes = {
    drizzle: PropTypes.object
}

export default CreateGame
