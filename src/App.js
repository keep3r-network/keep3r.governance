import React, { Component } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import {
  Switch,
  Route
} from "react-router-dom";
import IpfsRouter from 'ipfs-react-router'

import interestTheme from './theme';
import { colors } from './theme';

import Footer from './components/footer';
import Header from './components/header';
import Loader from './components/loader';
import SnackbarController from './components/snackbar';
import Proposals from './components/proposals';
import Propose from './components/propose';
import Proposal from './components/proposal';

import Keeper from './components/keeper';
import KeeperProfile from './components/keeperProfile';

import JobCreation from './components/jobCreation';
import Job from './components/job';

import {
  CONNECTION_CONNECTED,
  ACCOUNT_CHANGED,
  TX_SUBMITTED,
  TX_RECEIPT,
  TX_CONFIRMED,
  TX_UPDATED,
  START_LOADING,
  STOP_LOADING
} from './constants'

import { injected } from "./stores/connectors";

import Store from "./stores";
const emitter = Store.emitter
const store = Store.store

class App extends Component {
  state = {
    loading: [],
    transactions: store.getStore('transactions')
  };

  componentWillMount() {
    console.debug("HERE WE ARE")

    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(TX_SUBMITTED, this.addTXObject);
    emitter.on(TX_RECEIPT, this.txReceipt);
    emitter.on(TX_CONFIRMED, this.txConfirmed);
    emitter.on(START_LOADING, this.startLoading);
    emitter.on(STOP_LOADING, this.stopLoading);

    injected.isAuthorized().then(isAuthorized => {
      if (isAuthorized) {
        injected.activate()
        .then((a) => {
          store.setStore({ account: { address: a.account }, web3context: { library: { provider: a.provider } } })
          emitter.emit(CONNECTION_CONNECTED)
        })
        .catch((e) => {
          console.log(e)
        })
      } else {

      }
    });
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(TX_SUBMITTED, this.addTXObject);
    emitter.removeListener(TX_RECEIPT, this.txReceipt);
    emitter.removeListener(TX_CONFIRMED, this.txConfirmed);
    emitter.removeListener(START_LOADING, this.startLoading);
    emitter.removeListener(STOP_LOADING, this.stopLoading);
  };

  startLoading = (id) => {
    const loading = this.state.loading
    loading.push(id)
    this.setState({ loading })
  }

  stopLoading = (id) => {
    const loading = this.state.loading

    const index = loading.indexOf(id);
    loading.splice(index, 1);

    this.setState({ loading })
  }

  addTXObject = (hash) => {
    let transactions = store.getStore('transactions')
    const txObject = {
      hash: hash,
      status: 'Submitted'
    }
    transactions.push(txObject)
    store.setStore({ transactions: transactions })

    emitter.emit(TX_UPDATED)
  };

  txReceipt = (hash) => {
    let transactions = store.getStore('transactions')
    transactions = transactions.map((tx) => {
      if(tx.hash === hash) {
        tx.status = 'Receipt'
      }

      return tx
    })
    store.setStore({ transactions: transactions })
    emitter.emit(TX_UPDATED)
  };

  txConfirmed = (hash) => {
    let transactions = store.getStore('transactions')
    transactions = transactions.map((tx) => {
      if(tx.hash === hash) {
        tx.status = 'Confirmed'
      }

      return tx
    })
    store.setStore({ transactions: transactions })
    emitter.emit(TX_UPDATED)
  };

  connectionConnected = () => {
    if(window.ethereum) {
      window.ethereum.on('accountsChanged', function (accounts) {
        store.setStore({ account: { address: accounts[0] } })
        emitter.emit(ACCOUNT_CHANGED)
      })
    }
  }

  render() {
    const { loading } = this.state

    return (
      <MuiThemeProvider theme={ createMuiTheme(interestTheme) }>
        <CssBaseline />
        <IpfsRouter>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            alignItems: 'center',
            background: colors.background
          }}>
            <Header />
            <div style={{
              display: 'flex',
              flex: '1',
              minWidth: '100%',
              flexWrap: 'wrap',
              justifyContent: "center"
            }}>
              <Switch>
                <Route path="/governance/proposal/:id">
                  <Proposal />
                </Route>
                <Route path="/governance/proposals">
                  <Proposals />
                </Route>
                <Route path="/governance/proposal">
                  <Propose />
                </Route>
                <Route path="/governance">
                  <Proposals />
                </Route>
                <Route path="/keep3r/job/:address">
                  <Job />
                </Route>
                <Route path="/keep3r/job">
                  <JobCreation />
                </Route>
                <Route path="/keep3r/:address">
                  <KeeperProfile />
                </Route>
                <Route path="/keep3r">
                  <Keeper />
                </Route>
                <Route path="/">
                  <Keeper />
                </Route>
              </Switch>
            </div>
            { loading.length > 0 &&
              <Loader />
            }
          </div>
          <Footer />
          <SnackbarController />
        </IpfsRouter>
      </MuiThemeProvider>
    );
  }
}

export default App;
