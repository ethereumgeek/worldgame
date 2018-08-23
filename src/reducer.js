import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { drizzleReducers } from 'drizzle'
import GameReducer from './game/GameReducer'
import CreateGameReducer from './game/CreateGameReducer'
import MenuReducer from './game/MenuReducer'

const reducer = combineReducers({
  game: GameReducer,
  createGame: CreateGameReducer,
  menu: MenuReducer,
  routing: routerReducer,
  ...drizzleReducers
})

export default reducer
