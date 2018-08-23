const initialState = {
    input: {},
    playerCount: 2,
    validationMap: {},
    pendingNewGame: null
}

const CreateGameReducer = (state = initialState, action) => {
  
  if (action.type === 'INCREASE_PLAYER_COUNT')
  {
      let newValue = state.playerCount;
      if (newValue < 8) {
          newValue++;
      }

      return Object.assign({}, state, {
          playerCount: newValue
      });
  }

  if (action.type === 'REDUCE_PLAYER_COUNT')
  {
      let newValue = state.playerCount;
      if (newValue > 2) {
          newValue--;
      }

      return Object.assign({}, state, {
          playerCount: newValue
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

  if (action.type === 'PENDING_NEW_GAME')
  {
      let newValue = action.payload;

      return Object.assign({}, state, {
          pendingNewGame: newValue
      });
  }

  return state
}

export default CreateGameReducer
