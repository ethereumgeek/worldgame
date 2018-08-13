const initialState = {
  selectedTile: null
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

  return state
}

export default gameReducer
