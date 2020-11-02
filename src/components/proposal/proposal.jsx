import React, { Component } from "react";
import * as moment from 'moment';
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Button,
} from '@material-ui/core';
import Web3 from 'web3';

import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import DoneIcon from '@material-ui/icons/Done';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ClearIcon from '@material-ui/icons/Clear';
import AccessTimeIcon from '@material-ui/icons/AccessTime';

import {
  ERROR,
  VOTE_FOR,
  VOTE_FOR_RETURNED,
  VOTE_AGAINST,
  VOTE_AGAINST_RETURNED,
  GET_PROPOSALS,
  GET_PROPOSALS_RETURNED,
  CONNECTION_CONNECTED,
  GET_CURRENT_BLOCK,
  CURRENT_BLOCK_RETURNED
} from '../../constants'

import { colors } from '../../theme'

import Store from "../../stores";
const emitter = Store.emitter
const dispatcher = Store.dispatcher
const store = Store.store

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
    maxWidth: '900px',
    marginBottom: '20px'
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
  votesContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: '12px',
  },
  voteForContainer: {
    background: colors.progressGreen,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: '24px',
    cursor: 'pointer',
    flex: 1,
    margin: '12px',
    '&:hover': {
      background: colors.progressGreenHover,
    },
  },
  voteAgainstContainer: {
    background: colors.progressRed,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: '24px',
    cursor: 'pointer',
    flex: 1,
    margin: '12px',
    '&:hover': {
      background: colors.progressRedHover,
    },
  },
  voteIcon: {
    fontSize: '48px'
  },
  proposalDetails: {
    padding: '24px',
    border: '1px solid '+colors.borderBlue,
    display: 'flex',
    flexWrap: 'wrap',
    borderRadius: '10px',
    width: '100%',
    background: colors.white
  },
  voteButtonInline: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  title: {
    width: '100%',
  },
  subTitle: {
    width: '100%',
    color: colors.darkGray,
    marginBottom: '40px'
  },
  proposalActions: {
    marginBottom: '40px',
    marginTop: '12px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  proposalAction: {
    width: '100%',
    display: 'flex',
    padding: '12px',
    background: '#dedede',
    borderRadius: '10px',
    marginBottom: '12px'
  },
  proposalActionInfo: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 'calc(100% - 64px)',
    paddingBottom: '3px'
  },
  proposalActionDetails: {
    width: '100%',
    display: 'flex',
  },
  proposalActionTitle: {
    minWidth: '100px'
  },
  proposalActionIndex: {
    paddingLeft: '12px',
    paddingRight: '24px',
    display: 'flex',
    alignItems: 'center'
  },
  progressBar: {
    position: 'relative',
    height: '5px',
    background: colors.lightGray,
    borderRadius: '2px',
    margin: '12px'
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
  titleHeading: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  progressBars: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%'
  },
  votePercentContainer: {
    flex: 1
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
});


class Proposal extends Component {

  constructor(props) {
    super()

    let proposalId = (props && props.match && props.match.params && props.match.params.id) ? props.match.params.id : null

    if(!proposalId) {
      props.history.push('/governance/')
    }

    const proposals = store.getStore('proposals')
    let proposal = null

    if(proposals) {
      const returnedProposal = proposals.filter((pro) => {
        return pro.id === proposalId
      })
      if(returnedProposal.length > 0) {
        proposal = returnedProposal[0]
      }
    } else {
      dispatcher.dispatch({ type: GET_PROPOSALS, content: { } })
    }

    dispatcher.dispatch({ type: GET_CURRENT_BLOCK, content: { } })


    const now = store.getStore('currentBlock')

    this.state = {
      account: store.getStore('account'),
      proposal: proposal,
      currentBlock: now,
    }
  }

  componentWillMount() {
    emitter.on(VOTE_FOR_RETURNED, this.voteForReturned);
    emitter.on(VOTE_AGAINST_RETURNED, this.voteAgainstReturned);
    emitter.on(GET_PROPOSALS_RETURNED, this.proposalsReturned);
    emitter.on(ERROR, this.errorReturned);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CURRENT_BLOCK_RETURNED, this.currentBlockReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(VOTE_FOR_RETURNED, this.voteForReturned);
    emitter.removeListener(VOTE_AGAINST_RETURNED, this.voteAgainstReturned);
    emitter.removeListener(GET_PROPOSALS_RETURNED, this.proposalsReturned);
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(CURRENT_BLOCK_RETURNED, this.currentBlockReturned);
  };

  connectionConnected = () => {
    dispatcher.dispatch({ type: GET_PROPOSALS, content: {} })
    dispatcher.dispatch({ type: GET_CURRENT_BLOCK, content: {} })
  }

  proposalsReturned = () => {
    let proposalId = (this.props && this.props.match && this.props.match.params && this.props.match.params.id) ? this.props.match.params.id : null
    const proposals = store.getStore('proposals')
    let proposal = null

    if(proposals) {
      const returnedProposal = proposals.filter((pro) => {
        return pro.id === proposalId
      })
      if(returnedProposal.length > 0) {
        proposal = returnedProposal[0]
      }
    }

    this.setState({ proposal: proposal })
  };

  voteForReturned = () => {
    this.setState({ loading: false })
  };

  voteAgainstReturned = (txHash) => {
    this.setState({ loading: false })
  };

  currentBlockReturned = () => {
    this.setState({ currentBlock: store.getStore('currentBlock') })
  }

  errorReturned = (error) => {
    this.setState({ loading: false })
  };

  render() {
    const { classes } = this.props;
    const {
      loading,
      proposal,
      currentBlock
    } = this.state

    var address = null;
    if (proposal && proposal.proposer) {
      address = proposal.proposer.substring(0,8)+'...'+proposal.proposer.substring(proposal.proposer.length-6,proposal.proposer.length)
    }

    let forPercent = (proposal && proposal.forVotes > 0 ? (proposal.forVotes * 100 / (parseInt(proposal.forVotes) + parseInt(proposal.againstVotes))) : 0).toFixed(0)
    let againstPercent = (proposal && proposal.againstVotes > 0 ? (proposal.againstVotes * 100 / (parseInt(proposal.forVotes) + parseInt(proposal.againstVotes))) : 0).toFixed(0)

    let forVotes = (proposal ? (proposal.forVotes/10**18) : 0).toFixed(0)
    let againstVotes = (proposal ? (proposal.againstVotes/10**18) : 0).toFixed(0)

    let stateClass = classes.stateNeutral

    if(proposal) {
      if(['Succeeded', 'Queued', 'Executed', 'Active'].includes(proposal.stateDescription)) {
        stateClass = classes.stateSuccess
      }
      if(['Defeated'].includes(proposal.stateDescription)) {
        stateClass = classes.stateFail
      }
    }

    let voteClosed = false

    let endTime = ''
    if(proposal) {
      const blocksTillEnd = proposal.endBlock - currentBlock
      endTime = new Date().getTime() + (blocksTillEnd * 1000 * 13.8)

      if(proposal.endBlock <= currentBlock) {
        voteClosed = true
      }
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
              onClick={ () => {  this.props.history.push('/governance') } }
            >
              <Typography variant={ 'h4'}>Back</Typography>
            </Button>
          </div>
          <div className={ classes.topButton }>
          </div>
        </div>
        <div className={ classes.proposalDetails }>
          <div className={ classes.titleHeading }>
            <div>
              <Typography variant='h3' className={ classes.title }>Proposal #{ proposal ? proposal.id : '' }</Typography>
              <Typography variant='h4' className={ classes.subTitle }>Proposed by {address}</Typography>
            </div>
            <div>
              { proposal &&
                <Typography variant={ 'h5' } className={ stateClass }>{ proposal.stateDescription }
                  { proposal.stateDescription === 'Pending' && <AccessTimeIcon className={ classes.statusIconNeutral } /> }
                  { proposal.stateDescription === 'Active' && <ThumbUpIcon className={ classes.statusIconGreen } /> }
                  { proposal.stateDescription === 'Canceled' && <ClearIcon className={ classes.statusIconNeutral } /> }
                  { proposal.stateDescription === 'Defeated' && <ThumbDownIcon className={ classes.statusIconRed } /> }
                  { proposal.stateDescription === 'Succeeded' && <ThumbUpIcon className={ classes.statusIconGreen } /> }
                  { proposal.stateDescription === 'Queued' && <DoneIcon className={ classes.statusIconGreen } /> }
                  { proposal.stateDescription === 'Expired' && <ClearIcon className={ classes.statusIconNeutral } /> }
                  { proposal.stateDescription === 'Executed' && <DoneAllIcon className={ classes.statusIconGreen } /> }
                </Typography>
              }
            </div>
          </div>

          <Typography variant='h3' className={ classes.title }>Actions</Typography>
          { this.renderActions() }

          <Typography variant='h3' className={ classes.title }>Voting</Typography>
          { voteClosed  && <Typography variant='h4' className={ classes.subTitle }>Voting has concluded</Typography> }
          { !voteClosed && <Typography variant='h4' className={ classes.subTitle }>Voting concludes at ~{moment(endTime).format("YYYY/MM/DD kk:mm")}  (block #{ proposal ? proposal.endBlock : ''})</Typography> }

          { proposal && proposal.id &&
            <div className={ classes.progressBars }>
              <div className={ classes.votePercentContainer }>
                <div className={ classes.voteButtonInline }>
                  <Typography variant='h1'>For</Typography>
                </div>
                <div className={ classes.progressBar }>
                  <div className={ classes.votePercentBarGreen } style={{ width: forPercent+'%' }}></div>
                </div>
                <div className={ classes.voteButtonInline }>
                  <Typography variant='h2'>{ forPercent }%</Typography>
                  <Typography variant='h3'>{ forVotes } Votes</Typography>
                </div>
              </div>
              <div className={ classes.votePercentContainer }>
                <div className={ classes.voteButtonInline }>
                  <Typography variant='h1'>Against</Typography>
                </div>
                <div className={ classes.progressBar }>
                  <div className={ classes.votePercentBarRed } style={{ width: (againstPercent)+'%' }}></div>
                </div>
                <div className={ classes.voteButtonInline }>
                  <Typography variant='h2'>{ againstPercent }%</Typography>
                  <Typography variant='h3'>{ againstVotes } Votes</Typography>
                </div>
              </div>
            </div>
          }

          { proposal && proposal.id &&
            <div className={ classes.votesContainer }>
              <div className={ classes.voteForContainer } onClick={ this.onVoteFor }>
                <div className={ classes.voteButtonInline }>
                  <Typography variant='h1'>Vote</Typography>
                  <ThumbUpIcon className={ classes.voteIcon } />
                </div>
              </div>
              <div className={ classes.voteAgainstContainer } onClick={ this.onVoteAgainst }>
                <div className={ classes.voteButtonInline }>
                  <Typography variant='h1'>Vote</Typography>
                  <ThumbDownIcon className={ classes.voteIcon } />
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    )
  };

  renderActions = () => {
    const { classes } = this.props
    const { proposal } = this.state

    if(!(proposal && proposal.actions && proposal.actions.targets && proposal.actions.targets.length > 0)) {
      return <Typography variant='h4' className={ classes.subTitle }>No actions</Typography>
    }

    let actions = []
    let i = 0;
    for(i = 0; i < proposal.actions.targets.length; i++) {
      actions.push({
        index: (i+1),
        target: proposal.actions.targets[i],
        calldata: proposal.actions.calldatas[i],
        signature: proposal.actions.signatures[i],
        value: proposal.actions.values[i]
      })
    }

    let that = this

    return (
      <div className={ classes.proposalActions }>
         {
           actions.map((action) => {
             let params = that.decodeParams(action)

             return (
               <div className={ classes.proposalAction} key={ action.index }>
                 <div className={ classes.proposalActionIndex }>
                   <Typography variant='h1'>{action.index}</Typography>
                 </div>
                 <div className={ classes.proposalActionInfo }>
                   <div className={ classes.proposalActionDetails }>
                     <Typography variant='h4' className={ classes.proposalActionTitle }>address: </Typography>
                     <Typography variant='h4' className={ classes.proposalActionTarget } noWrap>{ action.target }</Typography>
                   </div>
                   <div className={ classes.proposalActionDetails }>
                     <Typography variant='h4' className={ classes.proposalActionTitle }>function: </Typography>
                     <Typography variant='h4' className={ classes.proposalActionTarget } noWrap>{ action.signature }</Typography>
                   </div>
                   <div className={ classes.proposalActionDetails }>
                     <Typography variant='h4' className={ classes.proposalActionTitle }>params: </Typography>
                     <Typography variant='h4' className={ classes.proposalActionTarget } noWrap>{ params }</Typography>
                   </div>
                   <div className={ classes.proposalActionDetails }>
                     <Typography variant='h4' className={ classes.proposalActionTitle }>value: </Typography>
                     <Typography variant='h4' className={ classes.proposalActionTarget } noWrap>{ action.value } ETH</Typography>
                   </div>
                 </div>
               </div>
             )
           })
         }
      </div>
    )
  }

  onVoteFor = () => {
    const { proposal } = this.state

    this.setState({ loading: true })
    dispatcher.dispatch({ type: VOTE_FOR, content: { proposal: proposal } })
  }

  onVoteAgainst = () => {
    const { proposal } = this.state

    this.setState({ loading: true })
    dispatcher.dispatch({ type: VOTE_AGAINST, content: { proposal: proposal } })
  }

  decodeParams = (action) => {

    try {
      const web3context = store.getStore('web3context')
      if(!web3context) {
        return null
      }
      const provider = web3context.library.provider
      if(!provider) {
        return null
      }

      const web3 = new Web3(provider);

      const openIndex = action.signature.indexOf('(')
      const closeIndex = action.signature.indexOf(')')

      const parametersString = action.signature.substring(openIndex+1, closeIndex)
      const parameters = parametersString.split(',')

      let data = web3.eth.abi.decodeParameters(parameters, action.calldata)

      let returnData = ''
      for(let i = 0; i < parameters.length; i++) {
        returnData = returnData + data[i] + ', '
      }

      return returnData.length > 0 ? returnData.substring(0, returnData.length - 2) : returnData
    } catch(ex) {
      console.log(ex)
    }
  }
}

export default withRouter(withStyles(styles, { withTheme: true })(Proposal));
