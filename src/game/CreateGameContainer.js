import CreateGame from './CreateGame'
import { drizzleConnect } from 'drizzle-react'

const mapStateToProps = (state, ownProps) => {
  return {
    createGame: state.createGame,
    accounts: state.accounts,
    WorldGame: state.contracts.WorldGame,
    drizzleStatus: state.drizzleStatus,
    web3: state.web3
  }
}


const CreateGameContainer = drizzleConnect(CreateGame, mapStateToProps);
export default CreateGameContainer
