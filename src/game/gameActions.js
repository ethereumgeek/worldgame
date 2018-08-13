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