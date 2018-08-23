//import store from '../store'
//const contract = require('truffle-contract')
//import contract from "truffle-contract"
//import BetManagerContract from '../contracts/BetManager.json'

export function selectTile(val) {
  return function(dispatch) {

    dispatch({
      type: 'SELECT_TILE',
      payload: val
    });
  }
}

export function hoverTile(val) {
  return function(dispatch) {

    dispatch({
      type: 'HOVER_TILE',
      payload: val
    });
  }
}

export function chooseTeam(val) {
  return function(dispatch) {

    dispatch({
      type: 'CHOOSE_TEAM',
      payload: val
    });
  }
}

export function startNewGame(playerList, maxBlocksPerTurn) {
  return function(dispatch) {
      console.log(playerList);
      console.log(maxBlocksPerTurn);
  }
}

export function checkWeb3(drizzleObj) {
  return function(dispatch) {

    let { eth, utils } = drizzleObj.web3;
    let gameInstance = drizzleObj.contracts.WorldGame;

    let { selectedAddress = "", networkVersion="" } = eth.currentProvider.publicConfigStore.getState();
    console.log("selectedAddress");
    console.log(selectedAddress);

    console.log("networkVersion");
    console.log(networkVersion);

    console.log(gameInstance);
    console.log(eth);
    
    let playerCount = "2";
    let maxBlocksPerTurn = "1000";
    let playerAddresses = [selectedAddress, "0x7FBd20182cb315aAd71b973304f2450DAD722c23"];
    let teamAvatars = utils.asciiToHex("EOAV");

    let stackId = gameInstance.methods.newGame.cacheSend(playerCount, maxBlocksPerTurn, playerAddresses, teamAvatars, {from: eth.address});
    console.log(stackId);

    let state = drizzleObj.store.getState();

    console.log(state.transactionStack);

    if (state.transactionStack[stackId]) {
      const txHash = state.transactionStack[stackId]
      console.log(state.transactions[txHash].status);
    }

  }
}