const initialState = {
    input: {},
    validationMap: {},
    selectedTileRegion: null,
    selectedTileSoldiers: null,
    selectedTileTurnNum: null,
    hoverTile: null,
    web3Instance: null,
    dataKeysByGame: {},
    selectedOverlayId: null
}

const gameReducer = (state = initialState, action) => {
  
  if (action.type === 'SHOW_OVERLAY')
  {
      let newValue = action.payload;

      return Object.assign({}, state, {
          selectedOverlayId: newValue,
          input: {},
          validationMap: {}
      });
  }

  if (action.type === 'SELECT_TILE')
  {
      let { regionId, soldiers, turnNum } = action.payload;
      return Object.assign({}, state, {
          selectedTileRegion: regionId,
          selectedTileSoldiers: soldiers,
          selectedTileTurnNum: turnNum
      });
  }

  if (action.type === 'HOVER_TILE')
  {
      let newValue = action.payload;
      return Object.assign({}, state, {
          hoverTile: newValue
      });
  }

  if (action.type === 'UPDATE_INPUT')
  {
      let { name, value } = action.payload;
      let inputObj = state.input;

      let newInputObj = Object.assign({}, inputObj, {
          [name]: value
      });

      return Object.assign({}, state, {
          input: newInputObj
      });
  }

  if (action.type === 'UPDATE_VALIDATION')
  {
      let newValue = action.payload;

      return Object.assign({}, state, {
          validationMap: newValue
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
