import React, { Component } from "react";
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { colors } from '../../theme'

import AutorenewIcon from '@material-ui/icons/Autorenew';
import DoneIcon from '@material-ui/icons/Done';
import DoneAllIcon from '@material-ui/icons/DoneAll';

import {
  ETHERSCAN_URL,
  TRANSACTION,
} from '../../constants'

const styles = theme => ({
  root: {
    display: 'flex',
    padding: '6px 0px',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  submittedIcon: {
    color: colors.yellow
  },
  confirmedIcon: {
    color: colors.green
  },
  address: {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
});

class Transaction extends Component {

  constructor(props) {
    super()

    this.state = { }
  }

  render() {
    const { classes, tx } = this.props;

    var address = 'Unknown';
    if (tx.hash) {
      address = tx.hash.substring(0,10)+'...'+tx.hash.substring(tx.hash.length-6,tx.hash.length)
    }

    return (
      <div className={ classes.root }>
        <Typography className={ classes.address } onClick={ this.viewTransactionClicked }>{ address }</Typography>
        <Typography>{ tx ? tx.status : 'None' }</Typography>
        {
          tx.status === 'Submitted' && <AutorenewIcon className={ classes.submittedIcon } />
        }
        {
          tx.status === 'Receipt' && <DoneIcon className={ classes.confirmedIcon } />
        }
        {
          tx.status === 'Confirmed' && <DoneAllIcon className={ classes.confirmedIcon } />
        }
      </div>
    )
  };

  viewTransactionClicked = (event) => {
    event.stopPropagation();
    window.open(ETHERSCAN_URL+TRANSACTION+this.props.tx.hash, '_blank')
  }
}

export default withStyles(styles)(Transaction);
