import React, { Component } from 'react'
import PropTypes from 'prop-types';
import GameContainer from './GameContainer';
import MenuContainer from './MenuContainer';
import CreateGameContainer from './CreateGameContainer';
import OpenGame from './OpenGame';
import './WorldGame.css';
import { openGame, syncGameCount, syncGamesForAddress, selectPage } from "./MenuActions"

class WorldGame extends Component {

  constructor(props, context) {
      super(props)

      // This binding is necessary to make `this` work in the callback
      this.openGame = this.openGame.bind(this);
      this.selectPage = this.selectPage.bind(this);
  }
  
  componentDidMount() {
      this.props.dispatch(syncGameCount(this.context.drizzle));
      this.props.dispatch(syncGamesForAddress(this.context.drizzle));
  }

  openGame(gameId) {
      this.props.dispatch(openGame(gameId));
  }

  selectPage(page) {
      this.props.dispatch(selectPage(page));
  }
  
  render() {
    let selectedPage = this.props.menu.selectedPage;
    let gameCountKey = this.props.menu.gameCountKey;
    let gamesForAddressKey = this.props.menu.gamesForAddressKey;
    let gameCount = 0;
    let gamesForAddressList = [];
    let gamesForAddressCount = [];

    if (
        gameCountKey !== null && 
        this.props.WorldGame.initialized && 
        this.props.WorldGame.numberOfGames.hasOwnProperty(gameCountKey) && 
        this.props.WorldGame.listGamesForAddress.hasOwnProperty(gamesForAddressKey)
    ) {
        gameCount = this.props.WorldGame.numberOfGames[gameCountKey].value;
        let gamesForAddressResp = this.props.WorldGame.listGamesForAddress[gamesForAddressKey].value;
        gamesForAddressList = gamesForAddressResp[0];
        gamesForAddressCount = parseInt(gamesForAddressResp[1], 10);
        gamesForAddressList = gamesForAddressList.slice(0, gamesForAddressCount);
    }
    
    return (
        <div>
            <MenuContainer />
            {selectedPage === "open" && (<OpenGame onOpenGame={this.openGame} onSelectPage={this.selectPage} gameCount={gameCount} gamesForAddressList={gamesForAddressList} />)}
            {selectedPage === "create" && (<CreateGameContainer />)}
            {selectedPage === "game" && (<GameContainer gameId={this.props.menu.selectedGameId} />)}
        </div>
    )
  }
}

WorldGame.contextTypes = {
  drizzle: PropTypes.object
}

export default WorldGame
