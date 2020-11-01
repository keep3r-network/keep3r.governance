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
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import AccessTimeIcon from '@material-ui/icons/AccessTime';

import Store from "../../stores";
import { colors } from '../../theme'

import {
  ETHERSCAN_URL,
  ADDRESS,
  ERROR,
  START_LOADING,
  STOP_LOADING,
  CONNECTION_CONNECTED,
  GET_KEEPER_PROFILE,
  KEEPER_PROFILE_RETURNED,
  SLASH,
  SLASH_RETURNED,
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
  between: {
    width: '40px'
  },
  intro: {
    width: '100%',
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '900px',
    marginBottom: '20px'
  },
  topButton: {
    width: '160px',
    marginBottom: '24px',
  },
  disaclaimer: {
    padding: '12px',
    border: '1px solid rgb(174, 174, 174)',
    borderRadius: '10px',
    marginBottom: '24px',
    background: colors.white,
  },
  profileContainer: {
    display: 'flex',
    width: '100%',
    border: '1px solid '+colors.borderBlue,
    borderRadius: '10px',
    padding: '24px',
    marginRight: '20px',
    flexDirection: 'column',
    background: colors.white,
    alignSelf: 'flex-start'
  },
  titleHeading: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: '40px',
    alignItems: 'center',
  },
  valueContainer: {
    marginBottom: '40px',
  },
  titleAddress: {
    width: '100%',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline'
    }
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
  }
})

const emitter = Store.emitter
const dispatcher = Store.dispatcher
const store = Store.store

class Keeper extends Component {

  constructor(props) {
    super()

    let keeperAddress = (props && props.match && props.match.params && props.match.params.address) ? props.match.params.address : null

    if(!keeperAddress) {
      props.history.push('/keep3r/')
    }

    emitter.emit(START_LOADING, GET_KEEPER_PROFILE)
    dispatcher.dispatch({ type: GET_KEEPER_PROFILE, content: { address: keeperAddress } })

    this.state = {
      account: store.getStore('account'),
      keeperProfile: {},
      loading: true
    }
  }

  componentWillMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(KEEPER_PROFILE_RETURNED, this.keeperProfileReturned)
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected)
    emitter.on(SLASH_RETURNED, this.slashReturned)
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(KEEPER_PROFILE_RETURNED, this.keeperProfileReturned)
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected)
    emitter.removeListener(SLASH_RETURNED, this.slashReturned)
  };

  connectionConnected = () => {
    const props = this.props
    let keeperAddress = (props && props.match && props.match.params && props.match.params.address) ? props.match.params.address : null

    if(!keeperAddress) {
      props.history.push('/keep3r/')
    }

    emitter.emit(START_LOADING, GET_KEEPER_PROFILE)
    dispatcher.dispatch({ type: GET_KEEPER_PROFILE, content: { address: keeperAddress } })
  }

  errorReturned = (source) => {
    emitter.emit(STOP_LOADING, source)
    this.setState({ loading: false })
  };

  keeperProfileReturned = (profile) => {
    this.setState({
      keeperProfile: profile,
      loading: false
    })

    emitter.emit(STOP_LOADING, GET_KEEPER_PROFILE)
  }

  slashReturned = (profile) => {
    this.setState({
      keeperProfile: profile,
      loading: false
    })

    emitter.emit(STOP_LOADING, SLASH)
  }

  render() {
    const { classes } = this.props;
    const {
      loading,
      keeperProfile,
      jobs,
      keepers,
      onBond,
      currentBlock
    } = this.state

    let state = 'Inactive'
    let stateClass = classes.stateNeutral

    if(parseInt(keeperProfile.bondings) > 0 && moment(keeperProfile.bondings*1000).valueOf() >= moment().valueOf()) {
      state = 'Activating'
    }
    if(keeperProfile.isActive) {
      state = 'Active'
      stateClass = classes.stateSuccess
    }

    if(keeperProfile.blacklisted) {
      state = 'Blacklisted'
      stateClass = classes.stateFail
    }

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
          <Typography variant={'h5'} className={ classes.disaclaimer }>This project is in beta. Use at your own risk.</Typography>
          <div className={ classes.topButton }>
          </div>
        </div>
        <div className={ classes.profileContainer }>
          <div className={ classes.titleHeading }>
            <div>
              <Typography variant='h3' className={ classes.titleAddress } onClick={ () => { this.navigateEtherscan(keeperProfile.profileAddress) } }>{ keeperProfile.profileAddress }</Typography>
              { keeperProfile.isActive && <Typography variant='h4' className={ classes.subTitle }>First seen at { moment(keeperProfile.firstSeen*1000).format("YYYY/MM/DD kk:mm") }</Typography> }
              { !keeperProfile.isActive && <Typography variant='h4' className={ classes.subTitle }>Not an active Keep3r</Typography> }
            </div>
            <div>
              { keeperProfile &&
                <Typography variant={ 'h5' } className={ stateClass }>{ state }
                  { state === 'Active' && <ThumbUpIcon className={ classes.statusIconGreen } /> }
                  { state === 'Activating' && <AccessTimeIcon className={ classes.statusIconNeutral } /> }
                  { state === 'Blacklisted' && <ThumbDownIcon className={ classes.statusIconRed } /> }
                  { state === 'Inactive' && <CloseIcon className={ classes.statusIconNeutral } /> }
                </Typography>
              }
            </div>
          </div>
          <div className={ classes.titleHeading }>
            <div>
              <Typography variant='h3' className={ classes.title }>{ keeperProfile.isActive ? moment(keeperProfile.lastJob*1000).format("YYYY/MM/DD kk:mm") : 'N/A' }</Typography>
              <Typography variant='h4' className={ classes.subTitle }>Last Job</Typography>
            </div>
            <div>
              { keeperProfile.isActive &&
                <Button
                  variant='contained'
                  size='small'
                  color='primary'
                  onClick={ this.onSlash }
                >
                  Slash
                </Button>
              }
            </div>
          </div>
          <div className={ classes.valueContainer }>
            <Typography variant='h3' className={ classes.title }>{ keeperProfile.workCompleted ? keeperProfile.workCompleted.toFixed(4) : '0' }</Typography>
            <Typography variant='h4' className={ classes.subTitle }>Work Completed</Typography>
          </div>
          <div className={ classes.valueContainer }>
            <Typography variant='h3' className={ classes.title }>{ keeperProfile.bonds } { keeperProfile.symbol }</Typography>
            <Typography variant='h4' className={ classes.subTitle }>Bonded</Typography>
          </div>
        </div>
      </div>
    )
  }

  navigateEtherscan = (address) => {
    window.open(ETHERSCAN_URL+ADDRESS+address)
  }

  onSlash = () => {
    const { keeperProfile } = this.state

    emitter.emit(START_LOADING, SLASH)
    dispatcher.dispatch({ type: 'SLASH', content: { address: keeperProfile.profileAddress } })
  }
}

export default withRouter(withStyles(styles)(Keeper));
