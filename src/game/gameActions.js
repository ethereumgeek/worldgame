//import store from '../store'
//const contract = require('truffle-contract')

export function selectTile(val) {
  return function(dispatch) {

    console.log("SELECT_TILE: " + val);

    dispatch({
      type: 'SELECT_TILE',
      payload: val
    });
  }
}

export function hoverTile(val) {
  return function(dispatch) {

    console.log("HOVER_TILE: " + val);

    dispatch({
      type: 'HOVER_TILE',
      payload: val
    });
  }
}