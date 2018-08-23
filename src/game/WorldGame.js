import React, { Component } from 'react'
import PropTypes from 'prop-types';
import GameContainer from './GameContainer';
import MenuContainer from './MenuContainer';
import CreateGameContainer from './CreateGameContainer';
import OpenGame from './OpenGame';
import './WorldGame.css';
import { openGame } from "./MenuActions"

class WorldGame extends Component {

  constructor(props, context) {
      super(props)

      // This binding is necessary to make `this` work in the callback
      this.openGame = this.openGame.bind(this);
  }

  openGame(gameId) {
      console.log("Open game: " + gameId);
      this.props.dispatch(openGame(gameId));
  }
  
  render() {
    let selectedPage = this.props.menu.selectedPage;

    return (
        <div>
            <MenuContainer />
            <div className="contentContainer">
                {selectedPage === "open" && (<OpenGame onOpenGame={this.openGame} />)}
                {selectedPage === "create" && (<CreateGameContainer />)}
                {selectedPage === "game" && (<GameContainer />)}
            </div>
        </div>
    )
  }
}

WorldGame.contextTypes = {
  drizzle: PropTypes.object
}

export default WorldGame
