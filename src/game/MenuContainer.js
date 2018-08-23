import Menu from './Menu'
import { drizzleConnect } from 'drizzle-react'

const mapStateToProps = (state, ownProps) => {
  return {
    menu: state.menu,
    accounts: state.accounts,
    WorldGame: state.contracts.WorldGame,
    drizzleStatus: state.drizzleStatus,
    web3: state.web3
  }
}


const MenuContainer = drizzleConnect(Menu, mapStateToProps);
export default MenuContainer
