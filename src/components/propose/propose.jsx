import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Button,
  TextField,
  MenuItem
} from '@material-ui/core';

import Loader from '../loader'
import AddContractModal from './addContractModal'
import ContractAction from './contractAction'

import Store from "../../stores";
import { colors } from '../../theme'

import {
  ERROR,
  PROPOSE,
  PROPOSE_RETURNED
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
  disaclaimer: {
    padding: '12px',
    border: '1px solid rgb(174, 174, 174)',
    borderRadius: '10px',
    marginBottom: '24px',
    background: colors.white,
  },
  proposalContainer: {
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
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  errorMessage: {
    color: colors.red,
    fontSize: '0.75rem',
    marginLeft: '14px'
  }
})

const emitter = Store.emitter
const dispatcher = Store.dispatcher
const store = Store.store

class Propose extends Component {

  constructor(props) {
    super()

    const account = store.getStore('account')

    this.state = {
      addContractModalOpen: false,
      loading: false,
      account: account,
      title: '',
      titleError: false,
      description: '',
      descriptionError: false,
      contracts: []
    }
  }

  componentWillMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(PROPOSE_RETURNED, this.showHash)
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(PROPOSE_RETURNED, this.showHash)
  };

  showHash = (txHash) => {

  };

  errorReturned = (error) => {
    this.setState({ loading: false })
  };

  render() {
    const { classes } = this.props;
    const {
      loading,
      title,
      titleError,
      description,
      descriptionError,
      addContractModalOpen,
      actionsError
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
              onClick={ () => {  this.props.history.push('/governance') } }
            >
              <Typography variant={ 'h4'}>Back</Typography>
            </Button>
          </div>
          <div className={ classes.topButton }>
          </div>
        </div>
        <div className={ classes.proposalContainer }>
          <div className={ classes.field }>
            <div className={ classes.fieldTitle }>
              <Typography variant='h4'>Title</Typography>
            </div>
            <TextField
              fullWidth
              disabled={ loading }
              className={ classes.titleInput }
              id={ 'title' }
              value={ title }
              error={ titleError }
              helperText={ titleError }
              onChange={ this.onChange }
              placeholder="Title for the proposal"
              variant="outlined"
            />
          </div>
          <div className={ classes.field }>
            <div className={ classes.fieldTitle }>
              <Typography variant='h4'>Description</Typography>
            </div>
            <TextField
              fullWidth
              disabled={ loading }
              className={ classes.titleInput }
              id={ 'description' }
              value={ description }
              error={ descriptionError }
              helperText={ descriptionError }
              onChange={ this.onChange }
              multiline
              rows={6}
              placeholder="Description for the proposal text"
              variant="outlined"
            />
          </div>
          <div className={ classes.field }>
            <div className={ classes.fieldTitle }>
              <Typography variant='h4'>Actions</Typography>
            </div>
            { this.renderContracts() }
          </div>
          <div>
            { actionsError && <Typography variant='body1' className={ classes.errorMessage }>{ actionsError }</Typography> }
          </div>
          <div className={ classes.buttonContainer}>
            <Button
              className={ classes.stakeButton }
              variant="outlined"
              color="secondary"
              disabled={ loading }
              onClick={ () => { this.onAddContract() } }
            >
              <Typography variant={ 'h4'}>Add Contract Action</Typography>
            </Button>
            <Button
              className={ classes.stakeButton }
              variant="outlined"
              color="secondary"
              disabled={ loading }
              onClick={ () => { this.onPropose() } }
            >
              <Typography variant={ 'h4'}>Generate proposal</Typography>
            </Button>
          </div>
        </div>
        { loading && <Loader /> }
        { addContractModalOpen && <AddContractModal onClose={ this.onCloseAddContract } onSubmit={ this.onSubmitAddContract } modalOpen={ addContractModalOpen } /> }
      </div>
    )
  }

  onAddContract = () => {
    this.setState({ addContractModalOpen: true })
  }

  onCloseAddContract = () => {
    this.setState({ addContractModalOpen: false })
  }

  onSubmitAddContract = (contract) => {
    let { contracts } = this.state
    contracts.push(contract)
    this.setState({ addContractModalOpen: false, contracts: contracts })
  }

  onRemoveContract = (contract, actionCount) => {
    let { contracts } = this.state
    contracts.splice(actionCount-1, 1);
    this.setState({ contracts: contracts })
  }

  storeContract = (contract, actionCount) => {
    let { contracts } = this.state
    contracts[actionCount-1] = contract;
    this.setState({ contracts: contracts })
  }

  renderContracts = () => {
    const { contracts } = this.state

    let iterator = 0
    return contracts.map((contract) => {
      iterator = iterator + 1
      return (<ContractAction key={ contract.address } contract={ contract } removeAction={ this.onRemoveContract } storeContract={ this.storeContract } actionCount={ iterator } />)
    })
  }

  renderFunctions = (abi) => {
    const funcs = abi.filter((thing) => {
      return thing.type === 'function' && thing.constant === false
    })

    return funcs.map((func) => {
      return <MenuItem value={ func.name }>{ func.name }</MenuItem>
    })
  }

  onChange = (event) => {
    let val = []
    val[event.target.id] = event.target.value
    this.setState(val)
  }

  onPropose = () => {
    this.setState({ titleError: false, descriptionError: false, actionsError: false })
    const { title, description, contracts } = this.state

    let error = false

    if(!title || title === '') {
      this.setState({ titleError: 'Title is required' })
      error = true
    }

    if(!description || description === '') {
      this.setState({ descriptionError: 'Description is required' })
      error = true
    }

    if(!contracts || contracts.length === 0) {
      this.setState({ actionsError: 'Actions are required' })
      error = true
    }

    if(!error) {
      this.setState({ loading: true })
      dispatcher.dispatch({ type: PROPOSE, content: { description: title+'\n'+description, contracts  } })
    }
  }
}

export default withRouter(withStyles(styles)(Propose));
