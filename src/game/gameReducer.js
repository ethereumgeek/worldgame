const initialState = {
  selectedTile: null,
  hoverTile: null
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
    })
  }

  if (action.type === 'HOVER_TILE')
  {
    let newValue = action.payload;
    return Object.assign({}, state, {
      hoverTile: newValue
    })
  }

  return state
}

export default gameReducer
