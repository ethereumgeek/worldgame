import React, { Component } from 'react'
import PropTypes from 'prop-types';
import GameContainer from './GameContainer';
import MenuContainer from './MenuContainer';
import CreateGameContainer from './CreateGameContainer';
import OpenGame from './OpenGame';
import './WorldGame.css';
import { openGame, syncGameCount, selectPage } from "./MenuActions"

class WorldGame extends Component {

  constructor(props, context) {
      super(props)

      // This binding is necessary to make `this` work in the callback
      this.openGame = this.openGame.bind(this);
      this.selectPage = this.selectPage.bind(this);
  }
  
  componentDidMount() {
      this.props.dispatch(syncGameCount(this.context.drizzle));
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
    let gameCount = 0;

    if (
        gameCountKey !== null && 
        this.props.WorldGame.initialized && 
        this.props.WorldGame.numberOfGames.hasOwnProperty(gameCountKey)
    ) {
        gameCount = this.props.WorldGame.numberOfGames[gameCountKey].value;
    }

    return (
        <div>
            <MenuContainer />
            {selectedPage === "open" && (<OpenGame onOpenGame={this.openGame} onSelectPage={this.selectPage} gameCount={gameCount} />)}
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
