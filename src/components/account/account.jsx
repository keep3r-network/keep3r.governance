import React, { Component } from "react";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Button
} from '@material-ui/core';
import {
  ToggleButton,
  ToggleButtonGroup
} from '@material-ui/lab';
import { colors } from '../../theme'

import {
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  ACCOUNT_CHANGED,
  ETHERSCAN_URL,
  ADDRESS,
  GAS_PRICES_RETURNED,
  TX_UPDATED
} from '../../constants'

import Transaction from './transaction'

import CloseIcon from '@material-ui/icons/Close';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import Store from "../../stores";
const store = Store.store
const emitter = Store.emitter

const styles = theme => ({
  root: {
    position: 'absolute',
    background: colors.white,
    border: '1px solid '+colors.borderBlue,
    width: '100%',
    borderRadius: '10px',
    borderTopRightRadius: '0px',
    padding: '24px',
    maxWidth: '600px',
    zIndex: 4,
    paddingTop: '8px',
    [theme.breakpoints.down('sm')]: {
      padding: '12px',
      top: '0px !important',
      minHeight: '100vh',
      borderRadius: '0px',
      maxWidth: '900px'
    }
  },
  topBar: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  closeIcon: {
    cursor: 'pointer',
    padding: '12px 12px',
    borderRadius: '30px',
    width: '50px',
    height: '50px',
    color: colors.text,
    '&:hover': {
      text: 'rgba(0, 0, 0, 0.1)'
    }
  },
  settingTitle: {
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: '6px'
  },
  gasFeeToggle: {
    width: '100%',
    borderRadius: '10px'
    //background: '#292b27',
  },
  gasFee: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px'
  },
  gasFeeText: {
    color: colors.text,
    fontWeight: 'bold'
  },
  setting: {
    marginBottom: '40px',
    width: '100%'
  },
  accountSetting: {
    border: '1px solid '+colors.borderBlue,
    borderRadius: '10px',
    padding: '12px',
    // background: colors.text
  },
  connectedRoot: {
    display: 'flex',
    alignItems: 'center'
  },
  connectedIcon: {
    height: '30px',
    marginRight: '12px'
  },
  connectedString: {
    flex: 1
  },
  addressContainer: {
    marginTop: '24px',
    display: 'flex',
    alignItems: 'center'
  },
  buttonIcon: {
    marginRight: '12px',
    [theme.breakpoints.down('sm')]: {
      marginRight: '6px',
    }
  },
  addresstext: {
    flex: 1
  },
  actionButton: {
    padding: '6px 12px'
  },
  connectRoot: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100px',
    // background: colors.text,
    borderRadius: '10px',
    width: '100%',
    '&:hover': {
      background: colors.headerBackground
    }
  },
  transactionsRoot: {
    border: '1px solid '+colors.borderBlue,
    borderRadius: '10px',
    padding: '12px',
    // background: colors.text
  },
});

class Account extends Component {

  constructor(props) {
    super()

    const anchorCoordinates = props.anchorEl.getBoundingClientRect()

    this.state = {
      account: store.getStore('account'),
      gasPrices: store.getStore('gasPrices'),
      gasSpeed: store.getStore('gasSpeed'),
      x: anchorCoordinates.x - 12,
      y: anchorCoordinates.y - 36,
      transactions: []
    }
  }

  componentWillMount() {
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(ACCOUNT_CHANGED, this.connectionConnected);
    emitter.on(GAS_PRICES_RETURNED, this.gasPricesReturned);
    emitter.on(TX_UPDATED, this.addTX);

    window.addEventListener("resize", this.onResize)
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.removeListener(ACCOUNT_CHANGED, this.connectionConnected);
    emitter.removeListener(GAS_PRICES_RETURNED, this.gasPricesReturned);
    emitter.removeListener(TX_UPDATED, this.addTX);

    window.removeEventListener("resize", this.onResize)
  }

  connectionConnected = () => {
    this.setState({ account: store.getStore('account') })
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore('account') })
  }

  gasPricesReturned = () => {
    this.setState({
      gasPrices: store.getStore('gasPrices'),
      gasSpeed: store.getStore('gasSpeed')
    })
  }

  addTX = () => {
    this.setState({ transactions: store.getStore('transactions') })
  }

  onResize = (s) => {
    const anchorCoordinates = this.props.anchorEl.getBoundingClientRect()

    this.setState({
      x: anchorCoordinates.x - 12,
      y: anchorCoordinates.y - 36
    })
  }

  render() {
    const { classes, handleClose } = this.props;
    const { y, account, gasPrices, gasSpeed } = this.state

    var address = 'Not Connected';
    if (account.address) {
      address = account.address.substring(0,8)+'...'+account.address.substring(account.address.length-6,account.address.length)
    }

    return (
      <div className={ classes.root } style={{ right: 0, top: y }}>
        <div className={ classes.setting }>
          <div className={ classes.topBar }>
            <Typography variant='h6' className={ classes.settingTitle }>Account</Typography>
            <CloseIcon className={ classes.closeIcon } onClick={ handleClose } />
          </div>
          { !account.address &&
            <div className={ classes.connectRoot } onClick={ this.connectWallet }>
              <img alt="" src={ require('../../assets/connectors/icn-metamask.svg') } className={ classes.connectedIcon } />
              <Typography variant='h5'>Connect to Metamask</Typography>
            </div>
          }
          { account.address &&
            <div className={ classes.accountSetting }>
              <div className={ classes.connectedRoot }>
                <img alt="" src={ require('../../assets/connectors/icn-metamask.svg') } className={ classes.connectedIcon } />
                <Typography className={ classes.connectedString } variant='h4'>Connected with Metamask</Typography>
                <Button
                  className={ classes.actionButton }
                  onClick={ this.closeWallet }>
                  <ExitToAppIcon className={ classes.buttonIcon } /> Disconnect
                </Button>
              </div>
              <div className={ classes.addressContainer }>
                <Typography variant='h3' className={ classes.addresstext }>{ address }</Typography>
                <Button
                  className={ classes.actionButton }
                  onClick={ (e) => { this.copyAddressToClipboard(e, account.address) } }>
                  <FileCopyIcon className={ classes.buttonIcon } /> Copy
                </Button>
                <Button
                  className={ classes.actionButton }
                  onClick={ (e) => { this.viewAddressClicked(e, account.address) } }>
                  <FileCopyIcon className={ classes.buttonIcon } /> View
                </Button>
              </div>
            </div>
          }
        </div>
        { account.address &&
          <div className={ classes.setting }>
            <Typography variant='h6' className={ classes.settingTitle }>Select Gas Setting</Typography>
            <ToggleButtonGroup color='secondary' value={ gasSpeed } onChange={this.handleTabChange} aria-label="type" exclusive size={ 'small' } fullwidth className={ classes.gasFeeToggle } >
              <ToggleButton value={'standard'} className={ classes.gasFee }>
                <div className={ classes.gasFee }>
                  <Typography variant={ 'h6' } className={ classes.gasFeeText }>Medium</Typography>
                  <Typography variant={ 'body1' } className={ classes.gasFeeText }>({ gasPrices.standard ? gasPrices.standard.toFixed(0) : '' } Gwei)</Typography>
                </div>
              </ToggleButton>
              <ToggleButton value={'fast'} className={ classes.gasFee }>
                <div className={ classes.gasFee }>
                  <Typography variant={ 'h6' } className={ classes.gasFeeText }>Fast</Typography>
                  <Typography variant={ 'body1' } className={ classes.gasFeeText }>({ gasPrices.fast ? gasPrices.fast.toFixed(0) : '' } Gwei)</Typography>
                </div>
              </ToggleButton>
              <ToggleButton value={'instant'} className={ classes.gasFee }>
                <div className={ classes.gasFee }>
                  <Typography variant={ 'h6' } className={ classes.gasFeeText }>Instant</Typography>
                  <Typography variant={ 'body1' } className={ classes.gasFeeText }>({ gasPrices.instant ? gasPrices.instant.toFixed(0) : '' } Gwei)</Typography>
                </div>
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
        }
        { /*account.address &&
          <div className={ classes.setting }>
            <Typography variant='h6' className={ classes.settingTitle }>Recent Transactions</Typography>
            <div className={ classes.transactionsRoot }>
              { this.renderTransactions() }
            </div>
          </div>
        */ }
      </div>
    )
  };

  viewAddressClicked = (event, address) => {
    event.stopPropagation();
    window.open(ETHERSCAN_URL+ADDRESS+address, '_blank')
  }

  handleTabChange = (event, newValue) => {
    localStorage.setItem('governance-gas-speed', newValue)
    this.setState({ gasSpeed :newValue})
  };

  copyAddressToClipboard = (event, address) => {
    event.stopPropagation();
    navigator.clipboard.writeText(address).then(() => {
      //show copied
    });
  };

  closeWallet = () => {
    store.setStore({ account: {}, web3context: null })

    const that = this

    window.setTimeout(() => {
      emitter.emit(CONNECTION_DISCONNECTED)
      that.props.handleClose()
    }, 1)
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

  renderTransactions = () => {
    const { transactions } = this.state

    if(transactions.length === 0) {
      return <Typography>None</Typography>
    }

    return transactions.slice((transactions.length > 5 ? transactions.length - 5 : 0), transactions.length).map((tx) => {
      return <Transaction tx={ tx } />
    })
  }
}

export default withStyles(styles)(Account);
