export function showOverlay(val) {
  return function(dispatch) {
    dispatch({
      type: 'SHOW_OVERLAY',
      payload: val
    });
  }
}

export function closeOverlay() {
  return function(dispatch) {
    dispatch({
      type: 'CLOSE_OVERLAY'
    });
  }
}

export function selectTile(regionId, soldiers, turnNum) {
  return function(dispatch) {
    dispatch({
      type: 'SELECT_TILE',
      payload: { regionId, soldiers, turnNum }
    });

    dispatch(closeOverlay());
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

export function syncGameData(drizzle, gameId) {
  return function(dispatch) {

    let soldiersByRegion = drizzle.contracts.WorldGame.methods.soldiersByRegion.cacheCall(gameId);
    let undeployedSoldiers = drizzle.contracts.WorldGame.methods.undeployedSoldiers.cacheCall(gameId);
    let pendingActions = drizzle.contracts.WorldGame.methods.pendingActions.cacheCall(gameId);
    let pendingActionOutcomes = drizzle.contracts.WorldGame.methods.pendingActionOutcomes.cacheCall(gameId);
    let turnAndPlayerInfo = drizzle.contracts.WorldGame.methods.turnAndPlayerInfo.cacheCall(gameId);
    let dataKeys = { soldiersByRegion, undeployedSoldiers, pendingActions, pendingActionOutcomes, turnAndPlayerInfo };
    
    dispatch({
      type: 'SET_DATA_KEYS',
      payload: { gameId, dataKeys }
    });
  }
}

export function updateInput(name, value) {
  return function(dispatch) {
      dispatch({
        type: 'UPDATE_INPUT',
        payload: { name, value }
      });
  }
}

export function updateValidation(validationMap) {
  return function(dispatch) {
      dispatch({
        type: 'UPDATE_VALIDATION',
        payload: validationMap
      });
  }
}

export function moveOrAttack(drizzle, gameId, turnNum, regionFrom, regionTo, soldiers) {
  return function(dispatch) {
    let { eth } = drizzle.web3;
    let gameInstance = drizzle.contracts.WorldGame;
    let { selectedAddress = "" } = eth.currentProvider.publicConfigStore.getState();

    let stackId = gameInstance.methods.attackOrMove.cacheSend(
        gameId.toString(), 
        turnNum.toString(), 
        regionFrom.toString(), 
        regionTo.toString(), 
        soldiers.toString(), 
        {from: selectedAddress}
    );
    
    dispatch({
      type: 'PENDING_ATTACK_OR_MOVE',
      payload: stackId
    });
  }
}

export function deployAndEndTurn(drizzle, gameId, turnNum, regionDeploy, soldiers) {
  return function(dispatch) {
    let { eth } = drizzle.web3;
    let gameInstance = drizzle.contracts.WorldGame;
    let { selectedAddress = "" } = eth.currentProvider.publicConfigStore.getState();

    let stackId = gameInstance.methods.deploySoldiersAndEndTurn.cacheSend(
        gameId.toString(), 
        turnNum.toString(), 
        regionDeploy.toString(), 
        soldiers.toString(), 
        {from: selectedAddress}
    );
      
    dispatch({
      type: 'PENDING_DEPLOY_END_TURN',
      payload: stackId
    });
  }
}

export function cacheBlockHash(drizzle, blockNum) {
  return function(dispatch) {
    let { eth } = drizzle.web3;
    let gameInstance = drizzle.contracts.WorldGame;
    let { selectedAddress = "" } = eth.currentProvider.publicConfigStore.getState();

    gameInstance.methods.cacheBlockHash32.cacheSend(
        blockNum.toString(), 
        {from: selectedAddress}
    );
  }
}

export function declareWinner(drizzle, gameId, winnerId) {
  return function(dispatch) {
    let { eth } = drizzle.web3;
    let gameInstance = drizzle.contracts.WorldGame;
    let { selectedAddress = "" } = eth.currentProvider.publicConfigStore.getState();

    gameInstance.methods.declareWinner.cacheSend(
        gameId.toString(), 
        winnerId.toString(), 
        {from: selectedAddress}
    );
  }
}
