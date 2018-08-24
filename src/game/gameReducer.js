const initialState = {
    selectedTile: null,
    hoverTile: null,
    yourTeam: "eagle",
    web3Instance: null,
    dataKeysByGame: {}
}

const gameReducer = (state = initialState, action) => {
  
  if (action.type === 'SELECT_TILE')
  {
      let newValue = action.payload;
      if(state.selectedTile === action.payload) {
          newValue = null;
      }

      return Object.assign({}, state, {
          selectedTile: newValue
      });
  }

  if (action.type === 'HOVER_TILE')
  {
      let newValue = action.payload;
      return Object.assign({}, state, {
          hoverTile: newValue
      });
  }

  if (action.type === 'CHOOSE_TEAM')
  {
      let newValue = action.payload;
      return Object.assign({}, state, {
          yourTeam: newValue
      });
  }

  if (action.type === 'SET_DATA_KEYS')
  {
    let { gameId, dataKeys } = action.payload;

    let newValue = Object.assign({}, state.dataKeysByGame, {
        [gameId]: dataKeys
    });

    return Object.assign({}, state, {
        dataKeysByGame: newValue
    });
  }

  return state
}

export default gameReducer
