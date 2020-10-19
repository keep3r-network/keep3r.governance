import React, { Component } from "react";
import {
  DialogContent,
  Dialog,
  Slide,
  Typography,
  Button,
  TextField
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { colors } from '../../theme'

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

const styles = theme => ({
  proposalContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: '28px 30px',
    borderRadius: '50px',
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
  }
})

class AddContractModal extends Component {

  constructor(props) {
    super()

    this.state = {
      address: '',
      addressError: '',
      abi: '',
      abiError: ''
    }
  }

  render() {
    const {
      onClose,
      modalOpen,
      classes
    } = this.props;
    const {
      address,
      addressError,
      abi,
      abiError
    } = this.state

    const fullScreen = window.innerWidth < 450;

    return (
      <Dialog open={ modalOpen } onClose={ onClose } fullWidth={ true } maxWidth={ 'sm' } TransitionComponent={ Transition } fullScreen={ fullScreen }>
        <DialogContent>
          <div className={ classes.proposalContainer }>
            <div className={ classes.field }>
              <div className={ classes.fieldTitle }>
                <Typography variant='h4'>Contract Address</Typography>
              </div>
              <TextField
                fullWidth
                className={ classes.titleInput }
                id={ 'address' }
                value={ address }
                error={ addressError }
                helperText={ addressError }
                onChange={ this.onChange }
                placeholder="Contract Address"
                variant="outlined"
              />
            </div>
            <div className={ classes.field }>
              <div className={ classes.fieldTitle }>
                <Typography variant='h4'>Contract ABI</Typography>
              </div>
              <TextField
                fullWidth
                className={ classes.titleInput }
                id={ 'abi' }
                value={ abi }
                error={ abiError }
                helperText={ abiError }
                onChange={ this.onChange }
                multiline
                rows={6}
                placeholder="Contract ABI"
                variant="outlined"
              />
            </div>
            <Button
              className={ classes.stakeButton }
              variant="outlined"
              color="secondary"
              onClick={ () => { this.onSubmit() } }
            >
              <Typography variant={ 'h4'}>Add Contract</Typography>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  };

  onChange = (event) => {
    let val = []
    val[event.target.id] = event.target.value
    this.setState(val)
  }

  onSubmit = () => {
    const {
      address,
      abi
    } = this.state

    const {
      onSubmit
    } = this.props

    if(!address || address === '') {
      this.setState({ addressError: 'Contract Address is required' })
      return false
    }

    if(!abi || abi === '') {
      this.setState({ abiError: 'Contract ABI is required' })
      return false
    }

    let abiJSON = null

    try {
      abiJSON = JSON.parse(abi)
    } catch (ex) {
      this.setState({ abiError: 'Contract ABI is invlid' })
      return false
    }

    onSubmit({ address: address, abi: abiJSON })

  }
}

export default withStyles(styles)(AddContractModal);
