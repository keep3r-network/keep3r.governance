import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Button,
} from '@material-ui/core';

import Loader from '../loader'

import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import DoneIcon from '@material-ui/icons/Done';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ClearIcon from '@material-ui/icons/Clear';
import AccessTimeIcon from '@material-ui/icons/AccessTime';

import Store from "../../stores";
import { colors } from '../../theme'

import {
  ERROR,
  CONNECTION_CONNECTED,
  PROPOSE_RETURNED,
  GET_PROPOSALS,
  GET_PROPOSALS_RETURNED,
  VOTE_FOR_RETURNED,
  VOTE_AGAINST_RETURNED,
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
  headingName: {
    flex: 1,
    flexShrink: 0
  },
  heading: {
    width: '150px',
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap'
  },
  votePercentContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center'
  },
  assetSummary: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    [theme.breakpoints.up('sm')]: {
      flexWrap: 'nowrap'
    }
  },
  proposalContainer: {
    maxWidth: 'calc(100vw - 24px)',
    width: '100%',
    border: '1px solid '+colors.borderBlue,
    padding: '24px',
    marginBottom: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    background: colors.white,
    '&:hover': {
      background: "rgba(0,0,0,0.1)",
    },
  },
  stakeButton: {
  },
  progressBar: {
    position: 'relative',
    height: '5px',
    background: colors.lightGray,
    borderRadius: '2px',
    margin: '12px',
    flex: 1
  },
  votePercentBarGreen: {
    background: colors.progressGreen,
    height: '100%',
    borderRadius: '2px'
  },
  votePercentBarRed: {
    background: colors.progressRed,
    height: '100%',
    borderRadius: '2px'
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
  voteIconGreen: {
    color: colors.progressGreen,
    fontSize: '40px',
    border: '3px solid ' + colors.progressGreen,
    borderRadius: '10px',
    padding: '3px'
  },
  voteIconRed: {
    color: colors.progressRed,
    fontSize: '40px',
    border: '3px solid ' + colors.progressRed,
    borderRadius: '10px',
    padding: '3px'
  },
  votes: {
    display: 'flex',
    alignItems: 'center'
  },
  gray: {
    color: colors.darkGray
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

class Vote extends Component {

  constructor(props) {
    super()

    const account = store.getStore('account')
    const proposals = store.getStore('proposals')

    this.state = {
      loading: false,
      account: account,
      proposals: proposals,
      value: 1,
    }

    dispatcher.dispatch({ type: GET_PROPOSALS, content: {} })
  }

  componentWillMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(PROPOSE_RETURNED, this.showHash)
    emitter.on(GET_PROPOSALS_RETURNED, this.proposalsReturned)
    emitter.on(VOTE_FOR_RETURNED, this.showHash);
    emitter.on(VOTE_AGAINST_RETURNED, this.showHash);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(PROPOSE_RETURNED, this.showHash)
    emitter.removeListener(GET_PROPOSALS_RETURNED, this.proposalsReturned)
    emitter.removeListener(VOTE_FOR_RETURNED, this.showHash);
    emitter.removeListener(VOTE_AGAINST_RETURNED, this.showHash);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
  };

  connectionConnected = () => {
    dispatcher.dispatch({ type: GET_PROPOSALS, content: {} })
  }

  errorReturned = (error) => {
    this.setState({ loading: false })
  };

  proposalsReturned = () => {
    const proposals = store.getStore('proposals')
    this.setState({ proposals: proposals, loading: false })
  }

  showHash = (txHash) => {

  };

  showAddressCopiedSnack = () => {

  }

  showSnackbar = (message, type) => {

  }

  render() {
    const { classes } = this.props;
    const {
      loading,
    } = this.state

    return (
      <div className={ classes.root }>
        <div className={ classes.intro }>
          <div className={ classes.topButton }>
          </div>
          <div className={ classes.topButton }>
            <Button
              className={ classes.stakeButton }
              variant="outlined"
              color="secondary"
              disabled={ loading }
              onClick={ () => { this.onPropose() } }
            >
              <Typography variant={ 'h4'}>New proposal</Typography>
            </Button>
          </div>
        </div>
        { this.renderProposals() }
        { loading && <Loader /> }
      </div>
    )
  }

  renderProposals = () => {
    const { proposals } = this.state
    const { classes } = this.props

    if(!proposals) {
      return <Typography>No proposals</Typography>
    }

    return proposals.map((proposal) => {

      const forPercent = (proposal && proposal.forVotes > 0 ? (proposal.forVotes * 100 / (parseInt(proposal.forVotes) + parseInt(proposal.againstVotes))) : 0).toFixed(0)
      const againstPercent = (proposal && proposal.againstVotes > 0 ? (proposal.againstVotes * 100 / (parseInt(proposal.forVotes) + parseInt(proposal.againstVotes))) : 0).toFixed(0)
      let stateClass = classes.stateNeutral

      if(['Succeeded', 'Queued', 'Executed'].includes(proposal.stateDescription)) {
        stateClass = classes.stateSuccess
      }
      if(['Defeated'].includes(proposal.stateDescription)) {
        stateClass = classes.stateFail
      }

      const voted = proposal.receipt.hasVoted
      const vote = proposal.receipt.support

      return (
        <div className={ classes.proposalContainer } key={ proposal.id } onClick={ () => { this.onViewProposal(proposal.id) } }>
          <div className={ classes.assetSummary }>
            <div className={classes.headingName}>
              <Typography variant={'h3'}>
                { proposal.title ? proposal.title : ('Proposal #' + proposal.id ) }
              </Typography>
              <Typography variant={ 'h5' } className={ classes.gray }>{ !voted ? 'You have not voted' : ( vote ? 'You voted for' : 'You voted against' ) }</Typography>
            </div>
            {
              ['Active'].includes(proposal.stateDescription) &&
              <div className={ classes.votes }>
                <div className={classes.heading}>
                  <div className={ classes.votePercentContainer }>
                    <div className={ classes.progressBar }>
                      <div className={ classes.votePercentBarGreen } style={{ width: forPercent+'%' }}></div>
                    </div>
                  </div>
                  <div className={ classes.votePercentContainer }>
                    <div className={ classes.progressBar }>
                      <div className={ classes.votePercentBarRed } style={{ width: (againstPercent)+'%' }}></div>
                    </div>
                  </div>
                </div>
                { forPercent >= againstPercent && <ThumbUpIcon className={ classes.voteIconGreen } /> }
                { againstPercent > forPercent && <ThumbDownIcon className={ classes.voteIconRed } /> }
              </div>
            }
            {
              !['Active'].includes(proposal.stateDescription) &&
              <div className={classes.heading}>
                <Typography variant={ 'h5' } className={ stateClass }>{ proposal.stateDescription }
                { proposal.stateDescription === 'Pending' && <AccessTimeIcon className={ classes.statusIconNeutral } /> }
                { proposal.stateDescription === 'Canceled' && <ClearIcon className={ classes.statusIconNeutral } /> }
                { proposal.stateDescription === 'Defeated' && <ThumbDownIcon className={ classes.statusIconRed } /> }
                { proposal.stateDescription === 'Succeeded' && <ThumbUpIcon className={ classes.statusIconGreen } /> }
                { proposal.stateDescription === 'Queued' && <DoneIcon className={ classes.statusIconGreen } /> }
                { proposal.stateDescription === 'Expired' && <ClearIcon className={ classes.statusIconNeutral } /> }
                { proposal.stateDescription === 'Executed' && <DoneAllIcon className={ classes.statusIconGreen } /> }
                </Typography>
              </div>
            }
          </div>
        </div>
      )
    })
  }

  startLoading = () => {
    this.setState({ loading: true })
  }

  onChange = (event) => {
    let val = []
    val[event.target.id] = event.target.value
    this.setState(val)
  }

  onPropose = () => {
    this.props.history.push('/governance/proposal')
  }

  onViewProposal = (id) => {
    this.props.history.push('/governance/proposal/'+id)
  }

}

export default withRouter(withStyles(styles)(Vote));
