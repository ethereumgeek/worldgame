
export function increasePlayerCount() {
    return function(dispatch) {
        dispatch({
          type: 'INCREASE_PLAYER_COUNT'
        });
    }
}

export function reducePlayerCount() {
    return function(dispatch) {
        dispatch({
          type: 'REDUCE_PLAYER_COUNT'
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

export function startNewGame(drizzle, playerCount, input) {
    return function(dispatch) {
        let { eth, utils } = drizzle.web3;
        let gameInstance = drizzle.contracts.WorldGame;
        let { selectedAddress = "" } = eth.currentProvider.publicConfigStore.getState();
        let maxBlocksPerTurn = 3000;
        let playerAddresses = [];
        for (let i = 1; i <= playerCount; i++) {
            let address = input["player" + i];
            playerAddresses.push(address);
        }

        let avatarList = ["EA", "MO", "EL", "PA", "PE", "GO", "KA", "UN"];
        avatarList = avatarList.slice(0, playerCount);
        let teamAvatars = utils.asciiToHex(avatarList.join(""));

        let stackId = gameInstance.methods.newGame.cacheSend(playerCount, maxBlocksPerTurn, playerAddresses, teamAvatars, {from: selectedAddress});
        
        dispatch({
          type: 'PENDING_NEW_GAME',
          payload: stackId
        });
        
    }
}

/*


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
*/