import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Button,
  TextField,
  InputAdornment
} from '@material-ui/core';

import Loader from '../loader'

import Store from "../../stores";
import { colors } from '../../theme'

import {
  ERROR,
  START_LOADING,
  STOP_LOADING,
  ADD_JOB,
  ADD_JOB_RETURNED,
  GET_BALANCES,
  BALANCES_RETURNED,
} from '../../constants'

const styles = theme => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '900px',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: '60px',
  },

  intro: {
    width: '100%',
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '900px',
    [theme.breakpoints.down('sm')]: {
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: '10px',
      marginTop: '10px'
    }
  },
  topButton: {
    width: '100px',
    marginBottom: '24px',
    [theme.breakpoints.down('sm')]: {
      minWidth: "90vw"
    }
  },
  backButton: {
    [theme.breakpoints.down('sm')]: {
      minWidth: "90vw"
    }
  },
  disclaimer: {
    padding: '12px',
    border: '1px solid rgb(174, 174, 174)',
    borderRadius: '10px',
    marginBottom: '24px',
    background: colors.white,
    [theme.breakpoints.down('sm')]: {
      minWidth: '90vw',
      marginBottom: '0',
    }
  },
  JobContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: '28px 30px',
    borderRadius: '10px',
    minWidth: '900px',
    border: '1px solid '+colors.borderBlue,
    margin: '20px',
    background: colors.white,
    [theme.breakpoints.down('sm')]: {
      minWidth: '90vw',
      marginTop: '0px',
    }
  },
  field: {
    minWidth: '100%',
    paddingBottom: '20px'
  },
  fieldTitle: {
    paddingLeft: '20px'
  },
  titleInput: {
    borderRadius: '25px'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%'
  },

  inputContainer: {
    flex: 1,
    display: 'flex',
    position: 'relative',
  },
  balance: {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    position: 'absolute',
    zIndex: 1,
    right: '8px',
    top: '2px',
    letterSpacing: '0.1rem',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  textField: {
    flex: 1,
    width: '100%',
    marginBottom: '19px',
    [theme.breakpoints.down('sm')]: {
      marginBottom: '6px',
    }
  },
})

const emitter = Store.emitter
const dispatcher = Store.dispatcher
const store = Store.store

class JobCreation extends Component {

  constructor(props) {
    super()

    const account = store.getStore('account')
    const keeperAsset = store.getStore('keeperAsset')

    this.state = {
      loading: false,
      account: account,
      keeperAsset: keeperAsset,
      address: '',
      addressError: false,
      addLiquidityAmount: '',
      addLiquidityAmountError: false,
      name: '',
      nameError: false,
      ipfs: '',
      ipfsError: false,
      docs: '',
      docsError: false,
    }

    dispatcher.dispatch({ type:GET_BALANCES, content: {} })
  }

  componentWillMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(ADD_JOB_RETURNED, this.addJobReturned)
    emitter.on(BALANCES_RETURNED, this.balancesReturned)
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(ADD_JOB_RETURNED, this.addJobReturned)
    emitter.removeListener(BALANCES_RETURNED, this.balancesReturned)
  };

  addJobReturned = () => {
    emitter.emit(STOP_LOADING, ADD_JOB)
    this.setState({ loading: false })
  }

  errorReturned = (source) => {
    emitter.emit(STOP_LOADING, source)
    this.setState({ loading: false })
  };

  balancesReturned = () => {
    this.setState({ keeperAsset: store.getStore('keeperAsset') })
  }

  render() {
    const { classes } = this.props;
    const {
      keeperAsset,
      loading,
      address,
      addressError,
      addLiquidityAmount,
      addLiquidityAmountError,
      name,
      nameError,
      docs,
      docsError,
      ipfs,
      ipfsError,
    } = this.state

    return (
      <div className={ classes.root }>
        <div className={ classes.intro }>
          <div className={ classes.topButton }>
            <Button
              className={ classes.backButton }
              variant="outlined"
              color="secondary"
              disabled={ loading }
              onClick={ () => {  this.props.history.push('/keep3r') } }
            >
              <Typography variant={ 'h4'}>Back</Typography>
            </Button>
          </div>
          <Typography variant={'h5'} className={ classes.disclaimer }>This project is in beta. Use at your own risk.</Typography>
          <div className={ classes.topButton }>
          </div>
        </div>
        <div className={ classes.JobContainer }>
          <div className={ classes.field }>
            <div className={ classes.fieldTitle }>
              <Typography variant='h4'>Job Address *</Typography>
            </div>
            <TextField
              fullWidth
              disabled={ loading }
              className={ classes.titleInput }
              id={ 'address' }
              value={ address }
              error={ addressError }
              helperText={ addressError }
              onChange={ this.onChange }
              placeholder="Ethereum address of your job"
              variant="outlined"
            />
          </div>
          <div className={ classes.field }>
            <div className={ classes.fieldTitle }>
              <Typography variant='h4'>Job Name</Typography>
            </div>
            <TextField
              fullWidth
              disabled={ loading }
              className={ classes.titleInput }
              id={ 'name' }
              value={ name }
              error={ nameError }
              helperText={ nameError }
              onChange={ this.onChange }
              placeholder="Name of the job"
              variant="outlined"
            />
          </div>
          <div className={ classes.field }>
            <div className={ classes.fieldTitle }>
              <Typography variant='h4'>Documentation</Typography>
            </div>
            <TextField
              fullWidth
              disabled={ loading }
              className={ classes.titleInput }
              id={ 'docs' }
              value={ docs }
              error={ docsError }
              helperText={ docsError }
              onChange={ this.onChange }
              placeholder="Documentation describing the job spec"
              variant="outlined"
            />
          </div>
          <div className={ classes.field }>
            <div className={ classes.fieldTitle }>
              <Typography variant='h4'>IPFS</Typography>
            </div>
            <TextField
              fullWidth
              disabled={ loading }
              className={ classes.titleInput }
              id={ 'ipfs' }
              value={ ipfs }
              error={ ipfsError }
              helperText={ ipfsError }
              onChange={ this.onChange }
              placeholder="IPFS info"
              variant="outlined"
            />
          </div>
          <div className={ classes.field }>
            <div className={ classes.fieldTitle }>
              <Typography variant='h4'>Provide liquidity</Typography>
            </div>
            <div className={ classes.inputContainer }>
              <Typography variant='h6' className={ classes.balance } onClick={ () => { this.maxClicked('addLiquidityAmount') } }>{ keeperAsset.balance.toFixed(4) } { keeperAsset.symbol }</Typography>
              <TextField
                fullwidth
                disabled={ loading }
                id='addLiquidityAmount'
                variant='outlined'
                color='primary'
                className={ classes.textField }
                placeholder='Liquidity amount'
                value={ addLiquidityAmount }
                error={ addLiquidityAmountError }
                onChange={ this.onAmountChange }
                InputProps={{
                  className: classes.inputField,
                  startAdornment: <InputAdornment position="start" className={ classes.inputAdornment }>
                    <img src={ require('../../assets/tokens/'+keeperAsset.logo) } width="30px" alt="" />
                  </InputAdornment>
                }}
              />
            </div>
          </div>

          <div className={ classes.buttonContainer}>
            <Button
              className={ classes.stakeButton }
              variant="outlined"
              color="secondary"
              disabled={ loading }
              onClick={ () => { this.onAddJob() } }
            >
              <Typography variant={ 'h4'}>Submit Job</Typography>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  onChange = (event) => {
    let val = []
    val[event.target.id] = event.target.value
    this.setState(val)
  }

  onAmountChange = (event) => {
    if(event.target.value !== '' && isNaN(event.target.value)) {
      return false
    }

    const { keeperAsset } = this.state
    if(event.target.id === 'addLiquidityAmount' && event.target.value > keeperAsset.balance) {
      event.target.value = keeperAsset.balance
    }

    let val = []
    val[event.target.id] = event.target.value
    this.setState(val)
  }

  onAddJob = () => {
    this.setState({ addressError: false, addLiquidityAmountError: false })
    const { address, addLiquidityAmount, name, ipfs, docs } = this.state

    let error = false

    if(!address || address === '') {
      this.setState({ addressError: 'Address is required' })
      error = true
    }

    if(!error) {
      emitter.emit(START_LOADING, ADD_JOB)
      this.setState({ loading: true })
      dispatcher.dispatch({ type: ADD_JOB, content: { address, addLiquidityAmount, name, ipfs, docs  } })
    }
  }

  maxClicked = (type) => {
    const {
      keeperAsset
    } = this.state

    switch (type) {
      case 'addLiquidityAmount':
        this.setState({ addLiquidityAmount: keeperAsset.balance })
        break;
      default:
    }
  }
}

export default withRouter(withStyles(styles)(JobCreation));
