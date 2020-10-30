import React, { Component } from "react";
import * as moment from 'moment';
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Button,
  TextField,
  InputAdornment
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';

import Store from "../../stores";
import { colors } from '../../theme'

import {
  ERROR,
  CONNECTION_CONNECTED,
  START_LOADING,
  STOP_LOADING,
  GET_JOB_PROFILE,
  JOB_PROFILE_RETURNED,
  GET_BALANCES,
  BALANCES_RETURNED,
  ADD_LIQUIDITY_TO_JOB,
  ADD_LIQUIDITY_TO_JOB_RETURNED,
  REMOVE_LIQUIDITY_FROM_JOB,
  REMOVE_LIQUIDITY_FROM_JOB_RETURNED,
  APPLY_CREDIT_TO_JOB,
  APPLY_CREDIT_TO_JOB_RETURNED,
  UNBOND_LIQUIDITY_FROM_JOB,
  UNBOND_LIQUIDITY_FROM_JOB_RETURNED
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
    marginTop: '40px'
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
  disclaimer: {
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
  liquidityContainer: {
    display: 'flex',
    width: '100%'
  },
  between: {
    width: '40px'
  },
  field: {
    paddingBottom: '20px',
    flex: '1'
  },
  fieldTitle: {
    paddingLeft: '20px'
  },
  titleInput: {
    borderRadius: '25px'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
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
  titleHeading: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: '40px',
    alignItems: 'center',
  },
  title: {
    width: '100%',
  },
  subTitle: {
    width: '100%',
    color: colors.darkGray,
  },
  stateNeutral: {
    border: '2px solid '+colors.lightGray,
    padding: '12px 24px',
    borderRadius: '10px',
    color: colors.lightGray+' !important',
    width: 'fit-content',
    display: 'flex',
    alignItems: 'center'
  },
  stateSuccess: {
    border: '2px solid '+colors.progressGreen,
    padding: '12px 24px',
    borderRadius: '10px',
    color: colors.progressGreen+' !important',
    width: 'fit-content',
    display: 'flex',
    alignItems: 'center'
  },
  stateFail: {
    border: '2px solid '+colors.progressRed,
    padding: '12px 24px',
    borderRadius: '10px',
    color: colors.progressRed+' !important',
    width: 'fit-content',
    display: 'flex',
    alignItems: 'center'
  },
  statusIconGreen: {
    fontSize: '20px',
    color: colors.progressGreen,
    marginLeft: '6px'
  },
  statusIconRed: {
    fontSize: '20px',
    color: colors.progressRed,
    marginLeft: '6px'
  },
  statusIconNeutral: {
    fontSize: '20px',
    color: colors.lightGray,
    marginLeft: '6px'
  },
  stakeButton: {
    width: '100%'
  },
  note: {
    fontSize: '12px',
    marginBottom: '24px'
  },
  notJobContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100px'
  },
  notJobInfo: {
    marginBottom: '12px'
  },
  jobMetadata: {
    minWidth: '100%',
    marginBottom: '40px',
    flexWrap: 'wrap',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  gray: {
    color: colors.darkGray
  },
  textColor: {
    color: colors.text
  },
  jobInfo: {
    marginBottom: '12px'
  }
})

const emitter = Store.emitter
const dispatcher = Store.dispatcher
const store = Store.store

class Job extends Component {

  constructor(props) {
    super()

    let jobAddress = (props && props.match && props.match.params && props.match.params.address) ? props.match.params.address : null

    if(!jobAddress) {
      props.history.push('/keep3r/')
    }

    dispatcher.dispatch({ type: GET_JOB_PROFILE, content: { address: jobAddress } })
    dispatcher.dispatch({ type:GET_BALANCES, content: {} })

    const account = store.getStore('account')
    const keeperAsset = store.getStore('keeperAsset')

    this.state = {
      loading: false,
      account: account,
      keeperAsset: keeperAsset,
      addLiquidityAmount: '',
      addLiquidityAmountError: false,
      removeLiquidityAmount: '',
      removeLiquidityAmountError: false,
      job: {}
    }
  }

  componentWillMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(BALANCES_RETURNED, this.balancesReturned)
    emitter.on(JOB_PROFILE_RETURNED, this.jobProfileReturned)
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected)
    emitter.on(ADD_LIQUIDITY_TO_JOB_RETURNED, this.addLiquidityToJobReturned)
    emitter.on(REMOVE_LIQUIDITY_FROM_JOB_RETURNED, this.removeLiquidityFromJobReturned)
    emitter.on(APPLY_CREDIT_TO_JOB_RETURNED, this.applyCreditToJobReturned)
    emitter.on(UNBOND_LIQUIDITY_FROM_JOB_RETURNED, this.unbondLiquidityFromJobReturned)
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(BALANCES_RETURNED, this.balancesReturned)
    emitter.removeListener(JOB_PROFILE_RETURNED, this.jobProfileReturned)
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected)
    emitter.removeListener(ADD_LIQUIDITY_TO_JOB_RETURNED, this.addLiquidityToJobReturned)
    emitter.removeListener(REMOVE_LIQUIDITY_FROM_JOB_RETURNED, this.removeLiquidityFromJobReturned)
    emitter.removeListener(APPLY_CREDIT_TO_JOB_RETURNED, this.applyCreditToJobReturned)
    emitter.removeListener(UNBOND_LIQUIDITY_FROM_JOB_RETURNED, this.unbondLiquidityFromJobReturned)
  };

  connectionConnected = () => {
    emitter.emit(START_LOADING, GET_JOB_PROFILE)

    const { props } = this
    let jobAddress = (props && props.match && props.match.params && props.match.params.address) ? props.match.params.address : null

    dispatcher.dispatch({ type: GET_JOB_PROFILE, content: { address: jobAddress } })
  }

  errorReturned = (source) => {
    emitter.emit(STOP_LOADING, source)
    this.setState({ loading: false })
  };

  balancesReturned = () => {
    this.setState({ keeperAsset: store.getStore('keeperAsset') })
  }

  jobProfileReturned = (jobProfile) => {
    console.log(jobProfile)
    emitter.emit(STOP_LOADING, GET_JOB_PROFILE)
    this.setState({ job: jobProfile })
  }

  addLiquidityToJobReturned = () => {
    this.setState({ loading: false, addLiquidityAmount: '' })
    emitter.emit(STOP_LOADING, ADD_LIQUIDITY_TO_JOB)
  }

  removeLiquidityFromJobReturned = () => {
    this.setState({ loading: false, removeLiquidityAmount: '' })
    emitter.emit(STOP_LOADING, REMOVE_LIQUIDITY_FROM_JOB)
  }

  applyCreditToJobReturned = () => {
    this.setState({ loading: false })
    emitter.emit(STOP_LOADING, APPLY_CREDIT_TO_JOB)
  }

  unbondLiquidityFromJobReturned = () => {
    this.setState({ loading: false })
    emitter.emit(STOP_LOADING, UNBOND_LIQUIDITY_FROM_JOB)
  }

  render() {
    const { classes } = this.props;
    const {
      keeperAsset,
      job,
      loading,
      addLiquidityAmount,
      addLiquidityAmountError,
      removeLiquidityAmount,
      removeLiquidityAmountError,
    } = this.state

    let state = 'Inactive'
    let stateClass = classes.stateNeutral

    if(job.isJob) {
      state = 'Active'
      stateClass = classes.stateSuccess
    }

    return (
      <div className={ classes.root }>
        <div className={ classes.intro }>
          <div className={ classes.topButton }>
            <Button
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
          <div className={ classes.titleHeading }>
            <div>
              <Typography variant='h3' className={ classes.title }>{ (job && job.address) ? job.address : 'N/A' }</Typography>
              <Typography variant='h4' className={ classes.subTitle }> { (job && job.isJob ? ( job._name ? job._name : 'Job found') : 'Job not available') } </Typography>
            </div>
            <div>
              { job &&
                <Typography variant={ 'h5' } className={ stateClass }>{ state }
                  { state === 'Active' && <ThumbUpIcon className={ classes.statusIconGreen } /> }
                  { state === 'Inactive' && <CloseIcon className={ classes.statusIconNeutral } /> }
                </Typography>
              }
            </div>
          </div>

          {
            job && !job.isJob &&
            <div className={ classes.notJobContainer }>
              <Typography variant='h4' className={ classes.notJobInfo }>This address is not activated as a job</Typography>
              <Button
                variant="outlined"
                color="secondary"
                disabled={ loading }
                onClick={ () => { this.onAddJob() } }
              >
                <Typography variant={ 'h4'}>Add Job</Typography>
              </Button>
            </div>
          }
          {
            job && job.isJob &&
            <div className={ classes.jobMetadata }>
              <div className={ classes.jobInfo }>
                <Typography variant='h4'><a href={job._docs} target='_blank' className={ classes.textColor }>{ job._docs ? job._docs : 'Not set' }</a></Typography>
                <Typography variant='h4' className={ classes.gray }>Documentation</Typography>
              </div>
              <div className={ classes.jobInfo }>
                <Typography variant='h4'>{ job._added ? moment(job._added*1000).format("YYYY/MM/DD kk:mm") : 'Not set' }</Typography>
                <Typography variant='h4' className={ classes.gray }>Job Added</Typography>
              </div>
              <div className={ classes.jobInfo }>
                <Typography variant='h4'>{ job.credits ? job.credits.toFixed(2) : '0.00' } { keeperAsset ? keeperAsset.symbol : '' }</Typography>
                <Typography variant='h4' className={ classes.gray }>Total Credits</Typography>
              </div>
            </div>
          }
          {
            job && job.isJob &&
            <div className={ classes.liquidityContainer }>
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
                <div>
                  <Typography className={ classes.note } variant='h4'>* 2 day liquidity bonding time</Typography>
                </div>
                <div className={ classes.buttonContainer}>
                  <Button
                    className={ classes.stakeButton }
                    variant="outlined"
                    color="secondary"
                    disabled={ loading }
                    onClick={ () => { this.onAddLiquidity() } }
                  >
                    <Typography variant={ 'h4'}>Provide Liquidity</Typography>
                  </Button>
                </div>
              </div>
              <div className={ classes.between }>

              </div>
              <div className={ classes.field }>
                <div className={ classes.fieldTitle }>
                  <Typography variant='h4'>Remove liquidity</Typography>
                </div>
                <div className={ classes.inputContainer }>
                  <Typography variant='h6' className={ classes.balance } onClick={ () => { this.maxClicked('removeLiquidityAmount') } }>{ keeperAsset.bonds.toFixed(4) } { keeperAsset.symbol }</Typography>
                  <TextField
                    fullwidth
                    disabled={ loading }
                    id='removeLiquidityAmount'
                    variant='outlined'
                    color='primary'
                    className={ classes.textField }
                    placeholder='Liquidity amount'
                    value={ removeLiquidityAmount }
                    error={ removeLiquidityAmountError }
                    onChange={ this.onAmountChange }
                    InputProps={{
                      className: classes.inputField,
                      startAdornment: <InputAdornment position="start" className={ classes.inputAdornment }>
                        <img src={ require('../../assets/tokens/'+keeperAsset.logo) } width="30px" alt="" />
                      </InputAdornment>
                    }}
                  />
                </div>
                <div>
                  <Typography className={ classes.note } variant='h4'>* 14 day liquidity unbonding time</Typography>
                </div>
                <div className={ classes.buttonContainer}>
                  <Button
                    className={ classes.stakeButton }
                    variant="outlined"
                    color="secondary"
                    disabled={ loading }
                    onClick={ () => { this.onRemoveLiquidity() } }
                  >
                    <Typography variant={ 'h4'}>Remove Liquidity</Typography>
                  </Button>
                </div>
              </div>
            </div>
          }
          {
            job && job.isJob &&
            <div className={ classes.liquidityContainer }>
              <div className={ classes.field }>
                <div className={ classes.buttonContainer}>
                  <Button
                    className={ classes.stakeButton }
                    variant="outlined"
                    color="secondary"
                    disabled={ loading }
                    onClick={ () => { this.onApplyCredit() } }
                  >
                    <Typography variant={ 'h4'}>Apply Credit</Typography>
                  </Button>
                </div>
              </div>
              <div className={ classes.between }>

              </div>
              <div className={ classes.field }>
                <div className={ classes.buttonContainer}>
                  <Button
                    className={ classes.stakeButton }
                    variant="outlined"
                    color="secondary"
                    disabled={ loading }
                    onClick={ () => { this.onUnbondLiquidity() } }
                  >
                    <Typography variant={ 'h4'}>Unbond Liquidity</Typography>
                  </Button>
                </div>
              </div>
            </div>
          }
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

    const { keeperAsset, job } = this.state
    if(event.target.id === 'addLiquidityAmount' && event.target.value > keeperAsset.balance) {
      event.target.value = keeperAsset.balance.toString()
    }
    if(event.target.id === 'addLiquidityAmount' && event.target.value > job.credits) {
      event.target.value = job.credits.toString()
    }

    let val = []
    val[event.target.id] = event.target.value
    this.setState(val)
  }

  maxClicked = (type) => {
    const {
      job,
      keeperAsset
    } = this.state

    switch (type) {
      case 'addLiquidityAmount':
        this.setState({ addLiquidityAmount: keeperAsset.balance.toString() })
        break;
      case 'removeLiquidityAmount':
        this.setState({ removeLiquidityAmount: job.credits.toString() })
        break;
      default:
    }
  }

  onAddJob = () => {
    this.props.history.push('/keep3r/job')
  }

  onAddLiquidity = () => {
    this.setState({ addressError: false, addLiquidityAmountError: false })
    const { job, addLiquidityAmount } = this.state

    let error = false

    if(!addLiquidityAmount || addLiquidityAmount === '') {
      this.setState({ addLiquidityAmountError: 'Liquidity amount is required' })
      error = true
    }

    if(!error) {
      emitter.emit(START_LOADING, ADD_LIQUIDITY_TO_JOB)
      this.setState({ loading: true })
      dispatcher.dispatch({ type: ADD_LIQUIDITY_TO_JOB, content: { address: job.address, addLiquidityAmount: addLiquidityAmount  } })
    }
  }

  onRemoveLiquidity = () => {
    this.setState({ addressError: false, removeLiquidityAmountError: false })
    const { job, removeLiquidityAmount } = this.state

    let error = false

    if(!removeLiquidityAmount || removeLiquidityAmount === '') {
      this.setState({ removeLiquidityAmountError: 'Liquidity amount is required' })
      error = true
    }

    if(!error) {
      emitter.emit(START_LOADING, ADD_LIQUIDITY_TO_JOB)
      this.setState({ loading: true })
      dispatcher.dispatch({ type: REMOVE_LIQUIDITY_FROM_JOB, content: { address: job.address, removeLiquidityAmount: removeLiquidityAmount  } })
    }
  }

  onApplyCredit = () => {
    const { job } = this.state

    emitter.emit(START_LOADING, APPLY_CREDIT_TO_JOB)
    this.setState({ loading: true })
    dispatcher.dispatch({ type: APPLY_CREDIT_TO_JOB, content: { address: job.address } })
  }

  onUnbondLiquidity = () => {
    const { job } = this.state

    emitter.emit(START_LOADING, UNBOND_LIQUIDITY_FROM_JOB)
    this.setState({ loading: true })
    dispatcher.dispatch({ type: UNBOND_LIQUIDITY_FROM_JOB, content: { address: job.address } })
  }
}

export default withRouter(withStyles(styles)(Job));
