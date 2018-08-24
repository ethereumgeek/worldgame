import Game from './Game'
import { drizzleConnect } from 'drizzle-react'

const mapStateToProps = (state, ownProps) => {
  return {
    gameId: ownProps.gameId,
    game: state.game,
    menu: state.menu,
    accounts: state.accounts,
    WorldGame: state.contracts.WorldGame,
    drizzleStatus: state.drizzleStatus,
    web3: state.web3
  }
}


const GameContainer = drizzleConnect(Game, mapStateToProps);
export default GameContainer
