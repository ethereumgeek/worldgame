//import { connect } from 'react-redux'
import WorldGame from './WorldGame'
//import { function } from './gameActions'
import { drizzleConnect } from 'drizzle-react'

const mapStateToProps = (state, ownProps) => {
  return {
    game: state.game,
    accounts: state.accounts,
    SimpleStorage: state.contracts.SimpleStorage,
    TutorialToken: state.contracts.TutorialToken,
    WorldGame: state.contracts.WorldGame,
    drizzleStatus: state.drizzleStatus,
    web3: state.web3
  }
}


const WorldGameContainer = drizzleConnect(WorldGame, mapStateToProps);
export default WorldGameContainer
