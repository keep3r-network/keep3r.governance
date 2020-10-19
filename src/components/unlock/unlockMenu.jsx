import React, { Component } from "react";
import { withStyles } from '@material-ui/core/styles';
import {
  Menu,
  MenuItem
} from '@material-ui/core';

import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import { colors } from '../../theme'

import {
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED
} from '../../constants'

import Store from "../../stores";
const emitter = Store.emitter
const store = Store.store

const styles = theme => ({
  icon: {
    marginRight: '24px',
    fontSize: '28px'
  },
  text: {
    color: colors.background
  }
});

class AccountMenu extends Component {
  render() {

    const {
      classes,
      handleClose,
      anchorEl
    } = this.props

    return (
      <Menu
        anchorEl={ anchorEl }
        keepMounted
        open={ Boolean(anchorEl) }
        onClose={ handleClose }
      >
        { this.renderMenuItems() }
        <MenuItem onClick={ () => { this.handleDisconnect() } } className={ classes.text }>
          <ExitToAppIcon className={ classes.icon } />
          Disconnect
        </MenuItem>
      </Menu>
    )
  };

  renderMenuItems = () => {
    const {
      classes
    } = this.props
    const connectors = store.getStore('connectorsByName')

    return connectors.map((item) => {
      return (
        <MenuItem onClick={ () => { this.handleConnect(item) } } className={ classes.text } key={ item.name }>
          <img className={ classes.icon } src={ require('../../assets/connectors/icn-metamask.svg') } alt=""/>
          { item.name }
        </MenuItem>
      )
    })
  }

  handleConnect = (con) => {
    let injected = con.connector

    injected.activate()
    .then((a) => {
      store.setStore({ account: { address: a.account }, web3context: { library: { provider: a.provider } } })
      emitter.emit(CONNECTION_CONNECTED)
      this.props.handleClose()
    })
    .catch((e) => {
      console.log(e)
    })
  }

  handleDisconnect = () => {
    store.setStore({ account: {}, web3context: {} })
    emitter.emit(CONNECTION_DISCONNECTED)
    this.props.handleClose()
  }
}

export default withStyles(styles)(AccountMenu);
