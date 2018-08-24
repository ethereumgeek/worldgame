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

export function syncGameData(drizzle, gameId) {
  return function(dispatch) {

    let soldiersByRegion = drizzle.contracts.WorldGame.methods.soldiersByRegion.cacheCall(gameId);
    let undeployedSoldiers = drizzle.contracts.WorldGame.methods.undeployedSoldiers.cacheCall(gameId);
    let pendingActions = drizzle.contracts.WorldGame.methods.pendingActions.cacheCall(gameId);
    let turnAndPlayerInfo = drizzle.contracts.WorldGame.methods.turnAndPlayerInfo.cacheCall(gameId);

    let dataKeys = { soldiersByRegion, undeployedSoldiers, pendingActions, turnAndPlayerInfo };

    console.log("syncGameData: " + gameId);
    console.log(dataKeys);
    
    dispatch({
      type: 'SET_DATA_KEYS',
      payload: { gameId, dataKeys }
    });
  }
}
