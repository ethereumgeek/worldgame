//import store from '../store'
//const contract = require('truffle-contract')

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