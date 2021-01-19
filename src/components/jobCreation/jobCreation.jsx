import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Button,
  TextField,
  MenuItem
} from '@material-ui/core';

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
  GET_LIQUIDITY_PAIRS,
  LIQUIDITY_PAIRS_RETURNED,
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
  },
  intro: {
    width: '100%',
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '900px'
  },
  topButton: {
    width: '100px',
    marginBottom: '24px',
  },
  disaclaimer: {
    padding: '12px',
    border: '1px solid rgb(174, 174, 174)',
    borderRadius: '10px',
    marginBottom: '24px',
    background: colors.white,
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
  assetSelectMenu: {
    display: 'flex',
    alignItems: 'center'
  },
  assetSelectIcon: {
    marginRight: '6px',
    display: 'flex'
  }
})

const emitter = Store.emitter
const dispatcher = Store.dispatcher
const store = Store.store

class JobCreation extends Component {

  constructor(props) {
    super()

    const account = store.getStore('account')
    const keeperAsset = store.getStore('keeperAsset')
    const liquidityPairs = store.getStore('liquidityPairs')
    const selectedLiquidityPair = liquidityPairs.length > 0 ? liquidityPairs[0] : null

    this.state = {
      loading: false,
      account: account,
      keeperAsset: keeperAsset,
      liquidityPairs: liquidityPairs,
      liquidityPair: selectedLiquidityPair ? selectedLiquidityPair.symbol : '',
      selectedLiquidityPair: selectedLiquidityPair,
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
    dispatcher.dispatch({ type: GET_LIQUIDITY_PAIRS, content: {} })
  }

  componentWillMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(ADD_JOB_RETURNED, this.addJobReturned)
    emitter.on(BALANCES_RETURNED, this.balancesReturned)
    emitter.on(LIQUIDITY_PAIRS_RETURNED, this.liquidityPairsReturned)
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(ADD_JOB_RETURNED, this.addJobReturned)
    emitter.removeListener(BALANCES_RETURNED, this.balancesReturned)
    emitter.removeListener(LIQUIDITY_PAIRS_RETURNED, this.liquidityPairsReturned)
  };

  liquidityPairsReturned = () => {
    const liquidityPairs = store.getStore('liquidityPairs')
    const selectedLiquidityPair = liquidityPairs.length > 0 ? liquidityPairs[0] : null
    this.setState({
      loading: false,
      liquidityPairs: liquidityPairs,
      liquidityPair: selectedLiquidityPair ? selectedLiquidityPair.symbol : '',
      selectedLiquidityPair: selectedLiquidityPair
    })
    emitter.emit(STOP_LOADING, GET_LIQUIDITY_PAIRS)
  }

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
      selectedLiquidityPair
    } = this.state

    return (
      <div className={ classes.root }>
        <div className={ classes.intro }>
          <div className={ classes.topButton }>
            <Button
              className={ classes.stakeButton }
              variant="outlined"
              color="secondary"
              disabled={ loading }
              onClick={ () => {  this.props.history.push('/keep3r') } }
            >
              <Typography variant={ 'h4'}>Back</Typography>
            </Button>
          </div>
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
              <Typography variant='h6' className={ classes.balance } onClick={ () => { this.maxClicked('addLiquidityAmount') } }>{ selectedLiquidityPair ? selectedLiquidityPair.balance.toFixed(4) : '0.0000' } { selectedLiquidityPair ? selectedLiquidityPair.symbol : '' }</Typography>
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
                  startAdornment: this.renderAssetSelect()
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

  renderAssetSelect = () => {
    const { loading, liquidityPairs, liquidityPair } = this.state
    const { classes } = this.props

    return (
      <TextField
        id={ 'liquidityPair' }
        name={ 'liquidityPair' }
        select
        value={ liquidityPair }
        onChange={ this.onAssetSelectChange }
        SelectProps={{
          native: false,
        }}
        fullWidth
        disabled={ loading }
        placeholder={ 'Select' }
        className={ classes.assetSelectRoot }
      >
        { liquidityPairs ? liquidityPairs.map(this.renderAssetOption) : null }
      </TextField>
    )
  }

  renderAssetOption = (option) => {
    const { classes } = this.props

    return (
      <MenuItem key={option.symbol} value={option.symbol} className={ classes.assetSelectMenu }>
        <div className={ classes.assetSelectIcon }>
          <img
            alt=""
            src={ this.getLogoForAsset(option) }
            height="30px"
          />
        </div>
        <div className={ classes.assetSelectIconName }>
          <Typography variant='h4'>{ option.symbol }</Typography>
        </div>
      </MenuItem>
    )
  }

  getLogoForAsset = (asset) => {
    try {
      return require('../../assets/tokens/'+asset.symbol+'-logo.png')
    } catch {
      return require('../../assets/tokens/unknown-logo.png')
    }
  }

  onAssetSelectChange = (event) => {
    let val = []
    val[event.target.name] = event.target.value
    this.setState(val)

    const thePair = this.state.liquidityPairs.filter((pair) => {
      return pair.symbol === event.target.value
    })

    this.setState({
      selectedLiquidityPair: thePair[0]
    })
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

    const { selectedLiquidityPair } = this.state
    if(event.target.id === 'addLiquidityAmount' && event.target.value > selectedLiquidityPair.balance) {
      event.target.value = selectedLiquidityPair.balance.toString()
    }

    let val = []
    val[event.target.id] = event.target.value
    this.setState(val)
  }

  onAddJob = () => {
    this.setState({ addressError: false, addLiquidityAmountError: false })
    const { address, addLiquidityAmount, name, ipfs, docs, selectedLiquidityPair } = this.state

    let error = false

    if(!address || address === '') {
      this.setState({ addressError: 'Address is required' })
      error = true
    }

    if(!error) {
      emitter.emit(START_LOADING, ADD_JOB)
      this.setState({ loading: true })
      dispatcher.dispatch({ type: ADD_JOB, content: { address, addLiquidityAmount, name, ipfs, docs, selectedLiquidityPair } })
    }
  }

  maxClicked = (type) => {
    const {
      selectedLiquidityPair
    } = this.state

    switch (type) {
      case 'addLiquidityAmount':
        this.setState({ addLiquidityAmount: selectedLiquidityPair ? selectedLiquidityPair.balance.toString() : '' })
        break;
      default:
    }
  }
}

export default withRouter(withStyles(styles)(JobCreation));
