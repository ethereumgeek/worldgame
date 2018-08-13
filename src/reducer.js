import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { drizzleReducers } from 'drizzle'
import { gameReducer } from './game/gameReducer'

const reducer = combineReducers({
  game: gameReducer,
  routing: routerReducer,
  ...drizzleReducers
})

export default reducer
