import React, { Component } from "react";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Button,
} from '@material-ui/core';
import { colors } from '../../theme'

import {
  START_LOADING,
  STOP_LOADING,
  ERROR,
  BALANCES_RETURNED,
  CALCULATE_MINT,
  CALCULATE_MINT_RETURNED,
  MINT,
  MINT_RETURNED,
  STAKE,
  STAKE_RETURNED,
  GET_REWARD,
  REWARD_RETURNED,
  GET_REWARDS_AVAILABLE,
  REWARDS_AVAILABLE_RETURNED,
} from '../../constants'

import CloseIcon from '@material-ui/icons/Close';

import Store from "../../stores";
const emitter = Store.emitter
const dispatcher = Store.dispatcher
const store = Store.store

const styles = theme => ({
  root: {
    position: 'absolute',
    background: colors.white,
    border: '1px solid '+colors.borderBlue,
    width: '100%',
    borderRadius: '10px',
    borderTopRightRadius: '0px',
    padding: '24px',
    maxWidth: '500px',
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
  bigBalances: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    height: '200px',
    border: '1px solid '+colors.borderBlue,
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '40px'
  },
  balances: {
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: '40px'
  },
  inputContainer: {
    flex: 1,
    display: 'flex',
    position: 'relative',
    marginRight: '12px'
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
  inputField: {
  },
  actionButton: {
    width: '120px',
    height: '46px',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      height: '40px'
    }
  },
  actionRoot: {
    [theme.breakpoints.down('sm')]: {
      minWidth: '100%',
      padding: '0px 12px',
      marginBottom: '24px'
    }
  },
  balanceContainer: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    marginTop: '12px',
    marginBottom: '12px',
    flexWrap: 'wrap'
  },
  claimContainer: {
    flex: 1
  },
  claimableHeading: {
    color: colors.darkGray,
    marginBottom: '6px',
    minWidth: '100%'
  }
});

class Currencies extends Component {

  constructor(props) {
    super()

    const anchorCoordinates = props.anchorEl.getBoundingClientRect()

    this.state = {
      loading: false,

      x: anchorCoordinates.x - 12,
      y: anchorCoordinates.y - 36,

      baseAsset: store.getStore('baseAsset'),
      liquidityAsset: store.getStore('liquidityAsset'),
      keeperAsset: store.getStore('keeperAsset'),
      poolAsset: store.getStore('poolAsset'),

      mintAmount: '',
      mintAmountError: false,
      stakeAmount: '',
      stakeAmountError: false,

      mintReceiveAmount: 0,
      stakeReceiveAmount: 0,

      rewardsAvailable: 0
    }

    // dispatcher.dispatch({ type: GET_REWARDS_AVAILABLE, content: {} })
  }

  componentWillMount() {
    window.addEventListener("resize", this.onResize)

    emitter.on(BALANCES_RETURNED, this.balancesReturned)
    emitter.on(CALCULATE_MINT_RETURNED, this.calcualteMintReturned)
    emitter.on(MINT_RETURNED, this.mintReturned)
    emitter.on(STAKE_RETURNED, this.stakeReturned)
    emitter.on(ERROR, this.errorReturned)
    emitter.on(REWARD_RETURNED, this.rewardReturned)
    emitter.on(REWARDS_AVAILABLE_RETURNED, this.rewardsAvailableReturned)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize)

    emitter.removeListener(BALANCES_RETURNED, this.balancesReturned)
    emitter.removeListener(CALCULATE_MINT_RETURNED, this.calcualteMintReturned)
    emitter.removeListener(MINT_RETURNED, this.mintReturned)
    emitter.removeListener(STAKE_RETURNED, this.stakeReturned)
    emitter.removeListener(ERROR, this.errorReturned)
    emitter.removeListener(REWARD_RETURNED, this.rewardReturned)
    emitter.removeListener(REWARDS_AVAILABLE_RETURNED, this.rewardsAvailableReturned)
  }

  onResize = (s) => {
    const anchorCoordinates = this.props.anchorEl.getBoundingClientRect()

    this.setState({
      x: anchorCoordinates.x - 12,
      y: anchorCoordinates.y - 36,
    })
  }

  balancesReturned = () => {
    this.setState({
      loading: false,
      baseAsset: store.getStore('baseAsset'),
      liquidityAsset: store.getStore('liquidityAsset'),
      keeperAsset: store.getStore('keeperAsset'),
      poolAsset: store.getStore('poolAsset'),
    })
  }

  calcualteMintReturned = (amount) => {
    this.setState({
      mintReceiveAmount: amount
    })
  }

  mintReturned = (amount) => {
    emitter.emit(STOP_LOADING, MINT)
    this.setState({ mintAmount: 0, mintReceiveAmount: 0, loading: false })
  }

  stakeReturned = (amount) => {
    emitter.emit(STOP_LOADING, STAKE)
    this.setState({ stakeAmount: 0, loading: false })
  }

  rewardReturned = (amount) => {
    emitter.emit(STOP_LOADING, GET_REWARD)
    this.setState({ loading: false })
  }

  rewardsAvailableReturned = (amount) => {
    this.setState({
      rewardsAvailable: amount
    })
  }

  errorReturned = (originalCall) => {
    this.setState({ loading: false })
    emitter.emit(STOP_LOADING, originalCall)
  }

  render() {
    const { classes, handleClose } = this.props;
    const {
      y,
      loading,
      // mintAmount,
      // mintAmountError,
      // poolAmount,
      // poolAmountError,
      // stakeAmount,
      // stakeAmountError,
      // baseAsset,
      // liquidityAsset,
      keeperAsset,
      // poolAsset,
      // mintReceiveAmount,
      rewardsAvailable
    } = this.state

    return (
      <div className={ classes.root } style={{ right: 0, top: y }}>
        <div className={ classes.topBar }>
          <Typography variant='h6' className={ classes.settingTitle }>Your Votes</Typography>
          <CloseIcon className={ classes.closeIcon } onClick={ handleClose } />
        </div>
        <div className={ classes.bigBalances }>
          <Typography variant='h1' color='primary'>{ (keeperAsset && keeperAsset.currentVotes) ? parseFloat(keeperAsset.currentVotes).toFixed(0) : '0' }</Typography>
          <Typography variant='h4'>{ keeperAsset ? keeperAsset.voteSymbol : 'N/A' }</Typography>
        </div>
      </div>
    )
  };


  /*
    ADD BACK IN LATER...
    <div className={ classes.balanceContainer }>
      <Typography variant='h4' className={ classes.claimableHeading }>Claimable:</Typography>
      <div className={ classes.claimContainer }>
        <Typography variant='h3'>{ rewardsAvailable } {keeperAsset.symbol}</Typography>
      </div>
      <div className={ classes.actionRoot }>
        <Button
          disabled={ loading }
          variant="text"
          color="primary"
          onClick={ this.onMint }
          className={ classes.actionButton }>
          Claim
        </Button>
      </div>
    </div>
    <Typography variant='h6' className={ classes.settingTitle }>Balances</Typography>
    <div className={ classes.balances }>
      <div className={ classes.balanceContainer }>
        <div className={ classes.inputContainer }>
          <Typography variant='h6' className={ classes.balance } onClick={ () => { this.maxClicked('mint') } }>{ baseAsset.balance.toFixed(4) } { baseAsset.symbol }</Typography>
          <TextField
            fullwidth
            disabled={ loading }
            id='mintAmount'
            variant='outlined'
            color='primary'
            className={ classes.textField }
            placeholder='You pay'
            value={ mintAmount }
            error={ mintAmountError }
            onChange={ this.onChange }
            onKeyDown={ this.inputKeyDown }
            helperText={ (mintReceiveAmount && mintReceiveAmount > 0) ? ('You will receive '+mintReceiveAmount.toFixed(4)+' '+liquidityAsset.symbol) : '' }
            InputProps={{
              className: classes.inputField,
              startAdornment: <InputAdornment position="start" className={ classes.inputAdornment }>
                <img src={ require('../../assets/tokens/'+baseAsset.logo) } width="30px" alt="" />
              </InputAdornment>
            }}
          />
        </div>
        <div className={ classes.actionRoot }>
          <Button
            disabled={ loading }
            variant="contained"
            color="primary"
            onClick={ this.onMint }
            className={ classes.actionButton }>
            Mint { liquidityAsset.symbol }
          </Button>
        </div>
      </div>
      <div className={ classes.balanceContainer }>
        <div className={ classes.inputContainer }>
          <Typography variant='h6' className={ classes.balance } onClick={ () => { this.maxClicked('mint') } }>{ liquidityAsset.balance.toFixed(4) } { liquidityAsset.symbol }</Typography>
          <TextField
            fullwidth
            disabled={ loading }
            id='poolAmount'
            variant='outlined'
            color='primary'
            className={ classes.textField }
            placeholder='You pay'
            value={ poolAmount }
            error={ poolAmountError }
            onChange={ this.onChange }
            onKeyDown={ this.inputKeyDown }
            InputProps={{
              className: classes.inputField,
              startAdornment: <InputAdornment position="start" className={ classes.inputAdornment }>
                <img src={ require('../../assets/tokens/'+liquidityAsset.logo) } width="30px" alt="" />
              </InputAdornment>
            }}
          />
        </div>
        <div className={ classes.actionRoot }>
          <Button
            disabled={ loading }
            variant="contained"
            color="primary"
            onClick={ this.onMint }
            className={ classes.actionButton }>
            Mint { poolAsset.symbol }
          </Button>
        </div>
      </div>
      <div className={ classes.balanceContainer }>
        <div className={ classes.inputContainer }>
          <Typography variant='h6' className={ classes.balance } onClick={ () => { this.maxClicked('stake') } }>{ poolAsset.balance.toFixed(4) } { poolAsset.symbol }</Typography>
          <TextField
            fullwidth
            disabled={ loading }
            id='stakeAmount'
            variant='outlined'
            color='primary'
            className={ classes.textField }
            placeholder='You pay'
            value={ stakeAmount }
            error={ stakeAmountError }
            onChange={ this.onChange }
            onKeyDown={ this.inputKeyDown }
            InputProps={{
              className: classes.inputField,
              startAdornment: <InputAdornment position="start" className={ classes.inputAdornment }>
                <img src={ require('../../assets/tokens/'+poolAsset.logo) } width="30px" alt="" />
              </InputAdornment>
            }}
          />
        </div>
        <div className={ classes.actionRoot }>
          <Button
            disabled={ loading }
            variant="contained"
            color="primary"
            onClick={ this.onStake }
            className={ classes.actionButton }>
            Get { rewardAsset.symbol }
          </Button>
        </div>
      </div>
    </div>

  */

  onChange = (event) => {

    if(event.target.value !== '' && isNaN(event.target.value)) {
      return false
    }

    const { baseAsset, liquidityAsset } = this.state
    if(event.target.id === 'mintAmount' && event.target.value > baseAsset.balance) {
      event.target.value = baseAsset.balance
    }
    if(event.target.id === 'stakeAmount' && event.target.value > liquidityAsset.balance) {
      event.target.value = liquidityAsset.balance
    }

    let val = []
    val[event.target.id] = event.target.value
    this.setState(val)

    if(event.target.id === 'mintAmount' && event.target.value !== '') {
      dispatcher.dispatch({ type: CALCULATE_MINT, content: { amount: event.target.value } })
    }

    if(event.target.id === 'stakeAmount' && event.target.value !== '') {
      // dispatcher.dispatch({ type: CALCULATE_MINT, content: { amount: event.target.value } })
    }
  }

  maxClicked = (type) => {
    const {
      baseAsset,
      liquidityAsset
    } = this.state

    switch (type) {
      case 'mint':
        this.setState({ mintAmount: baseAsset.balance })
        window.setTimeout(() => {
          dispatcher.dispatch({ type: CALCULATE_MINT, content: { amount: baseAsset.balance } })
        })
        break;
      case 'stake':
        this.setState({ stakeAmount: liquidityAsset.balance })
        break;
      default:
    }
  }

  onMint = () => {
    this.setState({ mintAmountError: false })
    const { mintAmount, baseAsset } = this.state

    let error = false

    if(mintAmount > baseAsset.balance) {
      error = true
      this.setState({ mintAmountError: 'Amount > balance' })
    }

    if(!error) {
      emitter.emit(START_LOADING, MINT)
      this.setState({ loading: true })
      dispatcher.dispatch({ type: MINT, content: { amount: mintAmount } })
    }
  }

  onPool = () => {
    this.setState({ stakeAmountError: false })
    const { stakeAmount, liquidityAsset } = this.state

    let error = false

    if(stakeAmount > liquidityAsset.balance) {
      error = true
      this.setState({ stakeAmountError: 'Amount > balance' })
    }

    if(!error) {
      emitter.emit(START_LOADING, STAKE)
      this.setState({ loading: true })
      dispatcher.dispatch({ type: STAKE, content: { amount: stakeAmount } })
    }
  }

  onStake = () => {
    this.setState({ stakeAmountError: false })
    const { stakeAmount, liquidityAsset } = this.state

    let error = false

    if(stakeAmount > liquidityAsset.balance) {
      error = true
      this.setState({ stakeAmountError: 'Amount > balance' })
    }

    if(!error) {
      emitter.emit(START_LOADING, STAKE)
      this.setState({ loading: true })
      dispatcher.dispatch({ type: STAKE, content: { amount: stakeAmount } })
    }
  }
}

export default withStyles(styles)(Currencies);
