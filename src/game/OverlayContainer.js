import Overlay from './Overlay'
import { drizzleConnect } from 'drizzle-react'

const mapStateToProps = (state, ownProps) => {
  return {
    game: state.game,
    menu: state.menu,
    accounts: state.accounts,
    WorldGame: state.contracts.WorldGame,
    drizzleStatus: state.drizzleStatus,
    web3: state.web3
  }
}


const OverlayContainer = drizzleConnect(Overlay, mapStateToProps);
export default OverlayContainer
