import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { increasePlayerCount, reducePlayerCount, updateInput, updateValidation, startNewGame, swapAvatar } from './CreateGameActions';
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
        this.getAvatarFromTeamId = this.getAvatarFromTeamId.bind(this);
        this.swapAvatar = this.swapAvatar.bind(this);
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
        this.props.dispatch(openGame(gameId));
    }

    startNewGame(event) {

        let { utils } = this.context.drizzle.web3;
        let playerMap = {};
        let avatarMap = {};
        let validationMap = {};

        let { input, playerCount } = this.props.createGame;
        let validAddresses = true;
        for (let i = 1; i <= playerCount; i++) {
            let playerVal = input["player" + i] || "";
            let avatarId = this.props.createGame.avatar[i];

            if (
                playerVal === "" || 
                !utils.isAddress(playerVal) || 
                playerMap.hasOwnProperty(playerVal.toLowerCase()) ||
                avatarMap.hasOwnProperty(avatarId)
            ) {
                validAddresses = false;
                validationMap["player" + i] = false;
            }
            else {
                playerMap[playerVal.toLowerCase()] = true;
                avatarMap[avatarId] = true;
                validationMap["player" + i] = true;
            }
        }

        if (validAddresses) {
            this.props.dispatch(startNewGame(this.context.drizzle, playerCount, input, this.props.createGame.avatar));
        }
        else {
            this.props.dispatch(updateValidation(validationMap));
        }
    }

    getAvatarFromTeamId(teamId) {
        const AVATAR_STRINGS = ["unicorn", "moose", "eagle", "grizzly", "penguin", "elephant", "panda", "lion", "zebra", "owl", "chicken", "triceratops", "crocodile", "spider", "monkey", "mouse", "dog", "cat", "beaver", "monster", "llama", "pig", "dragon", "owl_guitar", "alien", "dino", "rawr", "penguin_jacket", "snail", "polar_bear", "bird", "bird_red", "horse", "monster_pink", "gnu", "koala", "wolf", "baby", "giraffe", "safari_girl", "bat", "hippo", "shark", "tiger", "kitten", "teddybear", "fish", "kraken", "turtle", "frog", "ninja", "whale", "germ", "pirate_bird", "whale_pink", "ghost"];
        const avatarId = this.props.createGame.avatar[teamId];
        return AVATAR_STRINGS[avatarId];
    }

    swapAvatar(event, i, next) {
        this.props.dispatch(swapAvatar(i, next));
    }

    render() {

      let { input, playerCount, validationMap, pendingNewGame } = this.props.createGame;

      let playerAddressInputs = [];
      for (let i = 1; i <= playerCount; i++) {
          let playerVal = input["player" + i] || "";
          let notValid = validationMap.hasOwnProperty("player" + i) && validationMap["player" + i] === false;
          playerAddressInputs.push(
              <div key={i} >
                  <input disabled={false} autoComplete="off" placeholder={"Player " + i} type="text" className={"inputBox" + (notValid ? " notValid" : "")} name={"player" + i} value={playerVal} onChange={this.handleInputChange} />
                  <table style={{marginTop:5}}><tbody><tr>
                      <td><img onClick={(event) => this.swapAvatar(event, i-1, false)} src={"/leftArrow.png"} alt="" style={{width:70, height:70, cursor:"pointer"}}/></td>
                      <td onClick={(event) => this.swapAvatar(event, i-1, true)} style={{cursor:"pointer", width:70, height:70, textAlign:"center", verticalAlign:"middle", background:(notValid ? "#fdd" : "")}}>
                          <img src={"/" + this.getAvatarFromTeamId(i-1) + ".png"} alt="" style={{maxWidth:70, maxHeight:70}}/>
                      </td>
                      <td><img onClick={(event) => this.swapAvatar(event, i-1, true)} src={"/rightArrow.png"} alt="" style={{width:70, height:70, cursor:"pointer"}}/></td>
                  </tr></tbody></table>
              </div>
          );
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
              <div className="menuGap"></div>
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
