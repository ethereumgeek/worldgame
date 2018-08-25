import React, { Component } from 'react';
import './Overlay.css';
import PropTypes from 'prop-types';
import { showOverlay, updateInput, selectTile, deployAndEndTurn, updateValidation } from './GameActions'

class Overlay extends Component {
    constructor(props, context) {
      super(props);

        // This binding is necessary to make `this` work in the callback
        this.closeOverlay = this.closeOverlay.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.moveOrAttack = this.moveOrAttack.bind(this);
        this.deployAndEndTurn = this.deployAndEndTurn.bind(this);
        this.getContext = this.getContext.bind(this);
        this.node = null;
    }

    componentDidMount() {
        this.props.dispatch(updateValidation({}));
        document.addEventListener('mousedown', this.handleOutsideClick, false);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleOutsideClick, false);
    }

    closeOverlay(event) {
        this.props.dispatch(showOverlay(null));
    }

    handleOutsideClick(event) {
        if(this.node.contains(event.target)) {
            return;
        }

        this.closeOverlay(event);
    }

    moveOrAttack(event) {
        let input = this.props.game.input;
        let moveSoldiers = parseInt(input.moveSoldiers, 10) || 0;
        let { movableSoldiers, regionName } = this.getContext();
        if (moveSoldiers > 0 && moveSoldiers <= movableSoldiers) {
            this.props.dispatch(selectTile(regionName, moveSoldiers, this.props.turnNum));
        }
        else {
          this.props.dispatch(updateValidation({moveSoldiers: false, deploySoldiers: true}));
        }
    }

    deployAndEndTurn(event) {
        let input = this.props.game.input;
        let deploySoldiers = parseInt(input.deploySoldiers, 10) || 0;
        let { yourUndeployedSoldiers, regionId } = this.getContext();
        if (deploySoldiers > 0 && deploySoldiers <= yourUndeployedSoldiers) {

            if (!this.props.waitingForActions) {
                this.props.dispatch(deployAndEndTurn(
                    this.context.drizzle, 
                    this.props.gameId, 
                    this.props.turnNum, 
                    regionId, 
                    deploySoldiers
                ));
            }
            else {
                alert("Sorry, you have blocking actions.  Please wait for block #");
            }
        }
        else {
            this.props.dispatch(updateValidation({moveSoldiers: true, deploySoldiers: false}));
        }
    }

    handleInputChange(event) {
        let newValue = event.target.value;
        newValue = newValue.replace(/[^0-9]/gi, '');
        this.props.dispatch(updateInput(
            event.target.getAttribute("name"), 
            newValue
        ));
    }

    getContext() {
        let selectedOverlayId = this.props.game.selectedOverlayId;
        
        //console.log("selectedOverlayId: " + selectedOverlayId);
        const NO_PLAYER = 255;
        const NO_REGION = 255;
        let regionDisplay = "";
        let isYourTeam = false;
        let isNotOwned = false;
        let yourUndeployedSoldiers = 0;
        let soldiers = 0;
        let movableSoldiers = 0; 
        let points = 0;
        let avatar = null;
        let canMoveOrAttack = false;
        let canDeploySoldiers = false;
        let teamId = NO_PLAYER;
        let ownedByStr = "no one";
        let regionId = NO_REGION;
        let regionName = null;
        let yourTurn = false;
        if (selectedOverlayId !== null && this.props.data !== null) {
            let data = this.props.data;
            let tile = data.tile;
            yourTurn = data.yourTurn;
            regionDisplay = tile.display;
            isYourTeam = data.isYourTeam;
            isNotOwned = data.isNotOwned;
            soldiers = data.soldiers;
            points = tile.points;
            avatar = tile.avatar;
            teamId = tile.teamId;
            yourUndeployedSoldiers = data.yourUndeployedSoldiers;
            if (soldiers > 0) {
                movableSoldiers = soldiers - 1;
            }

            if (avatar !== null && teamId !== NO_PLAYER) {
                
                if (isYourTeam) {
                    ownedByStr = "you";
                }
                else {
                    ownedByStr = "opponent";
                }

                ownedByStr += " (player " + (teamId + 1) + ")";
            }

            regionId = tile.regionId;
            regionName = tile.name;

            canMoveOrAttack = yourTurn && isYourTeam && movableSoldiers > 0;
            canDeploySoldiers = yourTurn && (isYourTeam || isNotOwned) && yourUndeployedSoldiers > 0;
        }

        return {
            NO_PLAYER, 
            yourTurn, 
            selectedOverlayId, 
            regionDisplay, 
            isYourTeam, 
            isNotOwned, 
            yourUndeployedSoldiers, 
            soldiers, 
            movableSoldiers, 
            points, 
            avatar, 
            canMoveOrAttack, 
            canDeploySoldiers, 
            teamId, 
            ownedByStr,
            regionId,
            regionName
        };
    }
  
    render() {  
      
      let input = this.props.game.input;
      let validationMap = this.props.game.validationMap;
      let notValidMoveSoldiers = validationMap.hasOwnProperty("moveSoldiers") && validationMap["moveSoldiers"] === false;
      let notValidDeploySoldiers = validationMap.hasOwnProperty("deploySoldiers") && validationMap["deploySoldiers"] === false;

      let {
          selectedOverlayId, 
          yourTurn, 
          regionDisplay, 
          yourUndeployedSoldiers, 
          soldiers, 
          movableSoldiers, 
          points, 
          avatar, 
          canMoveOrAttack, 
          canDeploySoldiers, 
          ownedByStr
      } = this.getContext();

      console.log(this.getContext());

      let showOverlay = (selectedOverlayId !== null);

      return (
          <div>
              <div className={"fadeOverlay" + (showOverlay ? "" : " hide")}></div>
              <div className={"contentOverlay" + (showOverlay ? "" : " hide")}>
                  <div className="menuPlaceholder"></div>
                  <div ref={node => this.node = node} className="dialog">
                      <div>
                          <div className="groupTitle">{regionDisplay}</div>
                          {yourTurn ? (
                              <div className="yourTurnMsg">It's your turn</div>
                          ) : (
                              <div className="notYourTurnMsg">It's not your turn</div>
                          )}
                          <div className="summaryText">Owned by: {ownedByStr}</div>
                          {avatar !== null && (
                              <div><img src={"/" + avatar + ".png"} alt="" style={{maxWidth:70, maxHeight:70}}/></div>
                          )}
                          <div className="summaryText">Soldiers: {soldiers}</div>
                          <div className="summaryText">Points for owning: {points}</div>
                          {canMoveOrAttack && (
                          <div>
                              <input disabled={false} autoComplete="off" placeholder="Soldiers" type="text" className="inputBoxShort" name="moveSoldiers" value={input.moveSoldiers || ""} onChange={this.handleInputChange} />
                              <button className="btn" onClick={this.moveOrAttack}>Move or attack</button>
                              <div className={notValidMoveSoldiers ? "errorExplainer" : "inputExplainer"}>Maximum {movableSoldiers} soldiers</div>
                          </div>
                          )}
                          {canDeploySoldiers && (
                              <div>
                                  <input disabled={false} autoComplete="off" placeholder="Soldiers" type="text" className="inputBoxShort" name="deploySoldiers" value={input.deploySoldiers || ""} onChange={this.handleInputChange} />
                                  <button className="btn" onClick={this.deployAndEndTurn}>Deploy and end turn</button>
                                  <div className={notValidDeploySoldiers ? "errorExplainer" : "inputExplainer"}>Maximum {yourUndeployedSoldiers} soldiers</div>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      );
    }
  }


Overlay.contextTypes = {
    drizzle: PropTypes.object
}

export default Overlay
