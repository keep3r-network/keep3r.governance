import React, { Component } from "react";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Button,
  TextField,
  MenuItem
} from '@material-ui/core';

const styles = theme => ({
  field: {
    minWidth: '100%',
    paddingBottom: '20px'
  },
  titleInput: {
    minWidth: '80px',
    padding: '0px 6px'
  },
  actionContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 0px',
    minHeight: '42px'
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 0px',
    justifyContent: 'space-between'
  },
  contractAction: {
    borderRadius: '10px',
    background: '#dedede',
    padding: '12px',
    margin: '12px 0px'
  },
  contractTitle: {
    width: '100px'
  },
  contractAddress: {
  },
  filler: {
    padding: '0px 6px'
  },
  fillerFirst: {
    paddingRight: '6px'
  },
  inline: {
    display: 'flex',
    alignItems: 'flex-end'
  },
  signedRoot: {
    display: 'flex',
    alignItems: 'center'
  },
  signedIcon: {
    height: '30px',
    marginLeft: '6px'
  },
  signedString: {
    flex: 1,
    display: 'flex',
    alignItems: 'center'
  },
})

class ContractAction extends Component {

  constructor(props) {
    super()

    this.state = {
      func: '',
      funcError: null,
      params: [],
      paramsError: null,
      paramValues: [],
      paramValuesError: null,
    }
  }

  errorReturned = (error) => {

  };

  render() {
    const {
      classes,
      contract,
      actionCount
    } = this.props;

    const {
      func,
      funcError,
      value,
      valueError,
    } = this.state

    return <div className={ classes.contractAction }>
      <div className={ classes.headerContainer }>
        <Typography variant='h3' >Action { actionCount }</Typography>
        <Button
          variant='text'
          onClick={ this.removeAction }
        >
          <Typography variant={ 'h4'}>remove</Typography>
        </Button>
      </div>
      <div className={ classes.actionContainer }>
        <Typography variant='h4' className={ classes.contractTitle }>address: </Typography>
        <Typography variant='h4' className={ classes.contractAddress }>{ contract.address }</Typography>
      </div>
      <div className={ classes.actionContainer }>
        <Typography variant='h4' className={ classes.contractTitle }>func: </Typography>
        <TextField
          className={ classes.titleInput }
          id={ 'func' }
          name={ 'func' }
          value={ func }
          error={ funcError }
          helperText={ funcError }
          onChange={ this.onSelectChange }
          placeholder="function"
          variant="standard"
          select
        >
          { this.renderFunctions(contract.abi) }
        </TextField>
        <Typography variant='h3' className={ classes.filler }>(</Typography>
        { this.renderParams() }
        <Typography variant='h3' className={ classes.filler }>)</Typography>
      </div>
      <div className={ classes.actionContainer }>
        <Typography variant='h4' className={ classes.contractTitle }>value: </Typography>
        <TextField
          className={ classes.titleInput }
          id={ 'value' }
          value={ value }
          error={ valueError }
          helperText={ '' }
          onChange={ this.onValueChange }
          placeholder={ 'value' }
          variant="standard"
        />
      </div>
    </div>
  }

  renderFunctions = (abi) => {
    const funcs = abi.filter((thing) => {
      return thing.type === 'function' && thing.constant === false
    })

    return funcs.map((func) => {
      return <MenuItem key={ func.name } value={ func.name } >{ func.name }</MenuItem>
    })
  }

  renderParamsString = () => {
    const {
      params
    } = this.state

    const {
      classes
    } = this.props

    let index = -1

    return params.map((param) => {
      index = index + 1
      return (<div key={ param.name } className={ classes.inline }>
        <Typography variant='h4'>{ this.state[index] }</Typography>
        { param.name !== params[params.length-1].name && <Typography variant='h4'>,</Typography> }
      </div>)
    })
  }

  renderParams = () => {
    const {
      params
    } = this.state

    const {
      classes
    } = this.props

    let index = -1

    return params.map((param) => {
      index = index + 1
      return (<div key={ param.name } className={ classes.inline }>
        <TextField
          className={ classes.titleInput }
          id={ index.toString() }
          value={ this.state[index] }
          error={ this.state[index+'Error'] }
          helperText={ this.state[index+'Error'] }
          onChange={ this.onChange }
          placeholder={ param.name }
          variant="standard"
        />
        { param.name !== params[params.length-1].name && <Typography variant='h3'>,</Typography> }
      </div>)
    })
  }

  onSelectChange = (event) => {
    let val = []
    val[event.target.name] = event.target.value
    this.setState(val)

    const { contract, storeContract, actionCount } = this.props

    const func = contract.abi.filter((thing) => {
      return thing.name === event.target.value
    })

    this.setState({ params: func[0].inputs })

    const newContract = {
      address: contract.address,
      abi: contract.abi,
      func: event.target.value,
      params: func[0].inputs,
      paramValues: this.state.paramValues,
      value: event.target.value
    }

    storeContract( newContract, actionCount )
  }

  onValueChange = (event) => {
    let val = []
    val[event.target.id] = event.target.value
    this.setState(val)

    const { contract, storeContract, actionCount } = this.props

    const newContract = {
      address: contract.address,
      abi: contract.abi,
      func: this.state.func,
      params: this.state.params,
      paramValues: this.state.paramValues,
      value: event.target.value
    }

    storeContract( newContract, actionCount )
  }

  onChange = (event) => {
    let val = []
    val[event.target.id] = event.target.value
    this.setState(val)

    let { paramValues } = this.state
    paramValues[event.target.id] = event.target.value
    this.setState({ paramValues: paramValues })

    const { contract, storeContract, actionCount } = this.props

    const newContract = {
      address: contract.address,
      abi: contract.abi,
      func: this.state.func,
      params: this.state.params,
      paramValues: paramValues,
      value: event.target.value
    }

    storeContract( newContract, actionCount )
  }

  removeAction = () => {
    const { contract, actionCount } = this.props
    this.props.removeAction(contract, actionCount)
  }
}

export default withStyles(styles)(ContractAction);
