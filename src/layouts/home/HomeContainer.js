import Home from './Home'
import { drizzleConnect } from 'drizzle-react'

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    game: state.game,
    accounts: state.accounts,
    WorldGame: state.contracts.WorldGame,
    drizzleStatus: state.drizzleStatus
  }
}

const HomeContainer = drizzleConnect(Home, mapStateToProps);

export default HomeContainer
