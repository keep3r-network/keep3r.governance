import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
} from '@material-ui/core';
import { withRouter } from "react-router-dom";
import { colors } from '../../theme'

import {
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  ACCOUNT_CHANGED,
  GET_BALANCES,
  BALANCES_RETURNED,
  GET_GAS_PRICES,
  GAS_PRICES_RETURNED,
  START_LOADING,
  STOP_LOADING
} from '../../constants'

import Account from '../account';
import Currencies from '../currencies';

import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import Store from "../../stores";
const emitter = Store.emitter
const store = Store.store
const dispatcher = Store.dispatcher

const styles = theme => ({
  root: {
    verticalAlign: 'top',
    width: '100%',
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      marginBottom: '40px'
    }
  },
  headerV2: {
    background: colors.white,
    borderBottom: '1px solid '+colors.borderBlue,
    width: '100%',
    borderRadius: '0px',
    display: 'flex',
    padding: '24px 32px',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'space-between',
      padding: '16px 24px'
    }
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    cursor: 'pointer'
  },
  links: {
    display: 'flex'
  },
  link: {
    padding: '12px 0px',
    margin: '0px 12px',
    cursor: 'pointer',
    '&:hover': {
      paddingBottom: '9px',
      borderBottom: "3px solid "+colors.borderBlue,
    },
  },
  title: {
    textTransform: 'capitalize'
  },
  linkActive: {
    padding: '12px 0px',
    margin: '0px 12px',
    cursor: 'pointer',
    paddingBottom: '9px',
    borderBottom: "3px solid "+colors.borderBlue,
  },
  account: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    [theme.breakpoints.down('sm')]: {
      flex: 1
    }
  },
  walletAddress: {
    padding: '12px',
    border: '2px solid rgb(174, 174, 174)',
    borderRadius: '50px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    '&:hover': {
      border: "2px solid "+colors.borderBlue,
      background: 'rgba(47, 128, 237, 0.1)'
    },
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      position: 'absolute',
      top: '90px',
      border: "1px solid "+colors.borderBlue,
      background: colors.white
    }
  },
  name: {
    paddingLeft: '24px',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    }
  },
  accountDetailsSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    [theme.breakpoints.down('sm')]: {
      padding: '6px',
    },
  },
  accountDetailsAddress: {
    color: colors.background,
    fontWeight: 'bold',
    padding: '0px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  accountDetailsBalance: {
    color: colors.background,
    fontWeight: 'bold',
    padding: '0px 12px',
    borderRight: '2px solid '+colors.text,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline'
    },
    [theme.breakpoints.down('sm')]: {
      padding: '0px 6px',
    },
  },
  connectedDot: {
    borderRadius: '100px',
    border: '8px solid '+colors.green,
    marginLeft: '12px'
  },
});

class Header extends Component {

  constructor(props) {
    super()

    this.state = {
      account: store.getStore('account'),
      gasPrices: store.getStore('gasPrices'),
      rewardAsset: store.getStore('rewardAsset'),
      currenciesAnchorEl: null,
      accountAnchorEl: null,
      width: window.innerWidth,
    }
  }

  componentWillMount() {
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(ACCOUNT_CHANGED, this.connectionConnected);
    emitter.on(BALANCES_RETURNED, this.balancesReturned);
    emitter.on(GAS_PRICES_RETURNED, this.gasPricesReturned);
    window.addEventListener("resize", this.onResize)
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.removeListener(ACCOUNT_CHANGED, this.connectionConnected);
    emitter.removeListener(BALANCES_RETURNED, this.balancesReturned);
    emitter.removeListener(GAS_PRICES_RETURNED, this.gasPricesReturned);
    window.removeEventListener("resize", this.onResize)
  }

  onResize = (s) => {

    this.setState({
      width: window.innerWidth
    })
  }

  connectionConnected = () => {
    this.setState({ account: store.getStore('account') })

    emitter.emit(START_LOADING, GET_BALANCES)

    dispatcher.dispatch({ type: GET_BALANCES, content: {} })
    dispatcher.dispatch({ type: GET_GAS_PRICES, content: {} })
  }

  connectionDisconnected = () => {
    this.setState({ account: store.getStore('account') })
  }

  balancesReturned = () => {
    this.setState({ rewardAsset: store.getStore('rewardAsset') })
  }

  gasPricesReturned = () => {
    emitter.emit(STOP_LOADING, GET_GAS_PRICES)
    this.setState({ gasPrices: store.getStore('gasPrices') })
  }

  render() {
    const {
      classes
    } = this.props;

    const {
      account,
      accountAnchorEl,
      currenciesAnchorEl,
    } = this.state

    return (
      <div className={ classes.root }>
        <div className={ classes.headerV2 }>
          <div className={ classes.icon }>
            <img
              alt=""
              src={ require('../../assets/YFI-logo.png') }
              height={ '40px' }
              onClick={ () => { this.nav('') } }
            />
            <Typography variant={ 'h3'} className={ classes.name } onClick={ () => { this.nav('') } }>Governance</Typography>
          </div>
          <div className={ classes.links }>
            { this.renderLink('governance') }
          </div>
          <div className={ classes.account }>
            { !account.address &&
              <Typography variant={ 'h4'} className={ classes.walletAddress } noWrap onClick={this.connectWallet} >
                Connect wallet
              </Typography>
          }
            { account.address &&
              this.renderAccountInformation()
            }
            { accountAnchorEl && this.renderAccount() }
            { currenciesAnchorEl && this.renderCurrencies() }
          </div>
        </div>
      </div>
    )
  }

  renderAccountInformation = () => {
    const { classes } = this.props
    const { account, width, rewardAsset } = this.state

    var address = null;
    if (account.address) {
      address = account.address.substring(0,6)+'...'+account.address.substring(account.address.length-4,account.address.length)
    }

    return (
      <div className={ classes.accountDetailsSection }>
        <Typography className={ classes.accountDetailsBalance } onClick={ this.currencyClicked } variant='h4'>{ (rewardAsset) ? (rewardAsset.balance + ' ' + rewardAsset.symbol) : '0' }</Typography>
        { width > 899 && <Typography className={ classes.accountDetailsAddress } onClick={ this.addressClicked } variant='h4'>{ address } <div className={ classes.connectedDot }></div></Typography> }
        { width <= 899 && <AccountCircleIcon className={ classes.accountIcon } onClick={ this.addressClicked } /> }
      </div>
    )
  }

  currencyClicked = (e) => {
    const { currenciesAnchorEl } = this.state
    this.setState({ currenciesAnchorEl: currenciesAnchorEl ? null : e.target, accountAnchorEl: null })
  }

  addressClicked = (e) => {
    const { accountAnchorEl } = this.state
    this.setState({ accountAnchorEl: accountAnchorEl ? null : e.target, currenciesAnchorEl: null })
  }

  closeCurrenciesMenu = () => {
    this.setState({ currenciesAnchorEl: null })
  }

  closeAccountMenu = () => {
    this.setState({ accountAnchorEl: null })
  }

  renderCurrencies = () => {
    return (
      <Currencies anchorEl={ this.state.currenciesAnchorEl } handleClose={ this.closeCurrenciesMenu }  />
    )
  }

  renderAccount = () => {
    return (
      <Account anchorEl={ this.state.accountAnchorEl } handleClose={ this.closeAccountMenu }  />
    )
  }

  nav = (screen) => {
    this.props.history.push('/'+screen)
  }

  connectWallet = () => {
    const connectors = store.getStore('connectorsByName')
    const injected = connectors[0].connector

    injected.activate()
    .then((a) => {
      store.setStore({ account: { address: a.account }, web3context: { library: { provider: a.provider } } })
      emitter.emit(CONNECTION_CONNECTED)
    })
    .catch((e) => {
      console.log(e)
    })
  }

  renderLink = (screen) => {
    const {
      classes
    } = this.props;

    return (
      <div className={ (window.location.pathname.includes(screen))?classes.linkActive:classes.link } onClick={ () => { this.nav(screen) } }>
        <Typography variant={'h4'} className={ `title` }>{ screen }</Typography>
      </div>
    )
  }

  nav = (screen) => {
    if(screen === 'cover') {
      window.open("https://yinsure.finance", "_blank")
      return
    }
    this.props.history.push('/'+screen)
  }
}

export default withRouter(withStyles(styles)(Header));
