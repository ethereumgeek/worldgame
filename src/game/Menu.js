import React, { Component } from 'react';
import './Menu.css';
import { selectPage } from "./MenuActions"
import PropTypes from 'prop-types';

class Menu extends Component {
    constructor(props, context) {
      super(props);

        // This binding is necessary to make `this` work in the callback
        this.navigate = this.navigate.bind(this);
    }    

    navigate(event) {
        this.props.dispatch(selectPage(event.target.getAttribute("name")));
    }
  
    render() {  

      let selectedPage = this.props.menu.selectedPage;
      let gameId = this.props.menu.selectedGameId;

      return (
        <div>
          <div className="menuBar">
            <div className="menuInner">
              <span name="open" onClick={this.navigate} className={"menuBtn" + (selectedPage === "open" ? " selectedBtn": "")}>Open Game</span>
              <span name="create" onClick={this.navigate} className={"menuBtn" + (selectedPage === "create" ? " selectedBtn": "")}>Create New Game</span>
              {gameId !== null && (<span name="game" onClick={this.navigate} className={"menuBtn" + (selectedPage === "game" ? " selectedBtn": "")}>Game #{gameId}</span>)}
            </div>
          </div>
       </div>
      );
    }
  }


Menu.contextTypes = {
    drizzle: PropTypes.object
}

export default Menu
