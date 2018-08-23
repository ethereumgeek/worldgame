export function selectPage(page) {
  return function(dispatch) {
    dispatch({
      type: 'SELECT_PAGE',
      payload: page
    });
  }
}

export function openGame(gameId) {
  return function(dispatch) {
    dispatch({
      type: 'OPEN_GAME',
      payload: gameId
    });
  }
}