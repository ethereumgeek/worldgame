const initialState = {
    selectedPage: "open",
    selectedGameId: null,
    gameCountKey: null,
    gamesForAddressKey: null
}

const MenuReducer = (state = initialState, action) => {

    if (action.type === 'SELECT_PAGE')
    {
        let newValue = action.payload;

        return Object.assign({}, state, {
            selectedPage: newValue
        });
    }

    if (action.type === 'OPEN_GAME')
    {
        let newValue = action.payload;

        return Object.assign({}, state, {
            selectedGameId: newValue,
            selectedPage: "game"
        });
    }

    if (action.type === 'SET_GAME_COUNT_KEY')
    {
        let newValue = action.payload;

        return Object.assign({}, state, {
            gameCountKey: newValue
        });
    }

    if (action.type === 'SET_GAMES_FOR_ADDRESS')
    {
        let newValue = action.payload;

        return Object.assign({}, state, {
            gamesForAddressKey: newValue
        });
    }

    return state
}

export default MenuReducer
