
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

export function swapAvatar(teamId) {
  return function(dispatch) {
      dispatch({
        type: 'SWAP_AVATAR',
        payload: teamId
      });
  }
}

export function startNewGame(drizzle, playerCount, input, avatarIds) {
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

        let avatarList = [];
        for (let i = 0; i < playerCount; i++) {
            avatarList.push(String.fromCharCode(48 + avatarIds[i]));
        }

        console.log("avatarList");
        console.log(avatarList);
        let teamAvatars = utils.asciiToHex(avatarList.join(""));
        
        let stackId = gameInstance.methods.newGame.cacheSend(playerCount, maxBlocksPerTurn, playerAddresses, teamAvatars, {from: selectedAddress});
        
        dispatch({
          type: 'PENDING_NEW_GAME',
          payload: stackId
        });
        
    }
}