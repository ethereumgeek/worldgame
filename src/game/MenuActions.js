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

export function syncGameCount(drizzle) {
  return function(dispatch) {

    let dataKey = drizzle.contracts.WorldGame.methods.numberOfGames.cacheCall();

    dispatch({
      type: 'SET_GAME_COUNT_KEY',
      payload: dataKey
    });
  }
}