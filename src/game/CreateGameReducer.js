const initialState = {
    input: {},
    playerCount: 2,
    validationMap: {},
    pendingNewGame: null,
    avatar: [0, 1, 2, 3, 4, 5, 6, 7]
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

  if (action.type === 'SELECT_PAGE')
  {
      return Object.assign({}, state, {
          pendingNewGame: false
      });
  }

  if (action.type === 'SWAP_AVATAR')
  {
      const AVATAR_COUNT = 37;
      let index = action.payload;
      let newValue = (state.avatar[index] + 1) % AVATAR_COUNT;
      let newAvatarArray = Object.assign([], [...state.avatar], {[index]: newValue});
      return Object.assign({}, state, {
          avatar: newAvatarArray
      });
  }

  return state
}

export default CreateGameReducer
