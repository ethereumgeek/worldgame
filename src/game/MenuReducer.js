const initialState = {
    selectedPage: "open",
    selectedGameId: null
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

    return state
}

export default MenuReducer
