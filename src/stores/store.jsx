import config from "../config/config.js";
import async from 'async';
import {
  ERROR,
  SNACKBAR_ERROR,
  TX_SUBMITTED,
  TX_RECEIPT,
  TX_CONFIRMED,
  GET_BALANCES,
  BALANCES_RETURNED,
  GET_GAS_PRICES,
  GAS_PRICES_RETURNED,
  GET_PROPOSALS,
  GET_PROPOSALS_RETURNED,
  PROPOSE,
  PROPOSE_RETURNED,
  SIGN_ACTION,
  SIGN_ACTION_RETURNED,
  CALCULATE_MINT,
  CALCULATE_MINT_RETURNED,
  MINT,
  MINT_RETURNED,
  STAKE,
  STAKE_RETURNED,
  GET_CURRENT_BLOCK,
  CURRENT_BLOCK_RETURNED,
  GET_REWARDS_AVAILABLE,
  REWARDS_AVAILABLE_RETURNED,
  GET_REWARD,
  REWARD_RETURNED,
  VOTE_FOR,
  VOTE_FOR_RETURNED,
  VOTE_AGAINST,
  VOTE_AGAINST_RETURNED,
  GET_KEEPER,
  KEEPER_RETURNED,
  GET_KEEPER_PROFILE,
  KEEPER_PROFILE_RETURNED,
  GET_JOBS,
  JOBS_RETURNED,
  GET_KEEPERS,
  KEEPERS_RETURNED,
  ADD_BOND,
  ADD_BOND_RETURNED,
  REMOVE_BOND,
  REMOVE_BOND_RETURNED,
  ACTIVATE_BOND,
  ACTIVATE_BOND_RETURNED,
  ADD_JOB,
  ADD_JOB_RETURNED,
  GET_JOB_PROFILE,
  JOB_PROFILE_RETURNED,
  ADD_LIQUIDITY_TO_JOB,
  ADD_LIQUIDITY_TO_JOB_RETURNED,
  APPLY_CREDIT_TO_JOB,
  APPLY_CREDIT_TO_JOB_RETURNED,
  REMOVE_LIQUIDITY_FROM_JOB,
  REMOVE_LIQUIDITY_FROM_JOB_RETURNED,
  UNBOND_LIQUIDITY_FROM_JOB,
  UNBOND_LIQUIDITY_FROM_JOB_RETURNED,
  SLASH,
  SLASH_RETURNED,
} from '../constants';
import Web3 from 'web3';

import { injected } from "./connectors";
import { ERC20ABI } from "./abi/erc20ABI";
import { GovernanceABI } from './abi/governanceABI';
import { LiquidityABI } from './abi/liquidityABI';
import { RewardsABI } from './abi/rewardsABI';
import { PoolABI } from './abi/poolABI';
import { KeeperABI } from './abi/keeperABI';
import { JobRegistryABI } from './abi/jobRegistryABI';

const rp = require('request-promise');

const Dispatcher = require('flux').Dispatcher;
const Emitter = require('events').EventEmitter;

const dispatcher = new Dispatcher();
const emitter = new Emitter();

class Store {
  constructor() {

    this.store = {
      account: {},
      transactions: [],
      gasPrices: {
        "slow":90,
        "standard":90,
        "fast":100,
        "instant":130
      },
      gasSpeed: 'fast',
      currentBlock: 0,
      connectorsByName: [
        {
          name: 'Metamask',
          icon: 'icn-metamask.svg',
          connector: injected
        }
      ],
      web3context: null,
      baseAsset: {
        address: 'Ethereum',
        abi: null,
        symbol: 'ETH',
        name: 'Ether',
        decimals: 18,
        balance: 0,
        logo: 'ETH-logo.png',
        type: 'base'
      },
      liquidityAsset: {
        address: config.liquidityAddress,
        abi: LiquidityABI,
        symbol: 'LBI',
        name: 'Liquidity Income',
        decimals: 18,
        balance: 0,
        logo: 'LBI-logo.png',
        type: 'liquidity'
      },
      poolAsset: {
        address: config.poolAddress,
        abi: PoolABI,
        symbol: 'UNI-V2',
        name: 'Uniswap V2',
        decimals: 18,
        balance: 0,
        logo: 'UNI-logo.png',
        type: 'pool'
      },
      rewardAsset: {
        address: config.rewardsAddress,
        abi: RewardsABI,
        symbol: 'KBD',
        name: 'Liquidity Income Delegate',
        decimals: 18,
        balance: 0,
        logo: 'LBD-logo.png',
        type: 'reward'
      },
      keeperAsset: {
        address: config.keeperAddress,
        abi: KeeperABI,
        symbol: 'KPR',
        name: 'Keep3r',
        decimals: 18,
        balance: 0,
        logo: 'KPR-logo.png',
        type: 'keeper',
        bonds: 0,
        pendingBonds: 0,
        bondings: 0,
        unbondings: 0,
        blacklisted: false,
        disputed: false,
        lastJob: 0,
        firstSeen: 0,
        delegates: false,
        work: 0,
        workCompleted: 0,
        isActive: false,
        voteSymbol: 'KBD',
        currentVotes: 0
      },
      jobs: [

      ],
      keepers: [

      ]
    }

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case GET_BALANCES:
            this.getBalances(payload);
            break;
          case GET_GAS_PRICES:
            this.getGasPrices(payload);
            break;
          case PROPOSE:
            this.propose(payload);
            break;
          case SIGN_ACTION:
            this.signAction(payload);
            break;
          case CALCULATE_MINT:
            this.calculateMint(payload);
            break;
          case MINT:
            this.mint(payload);
            break;
          case STAKE:
            this.stake(payload);
            break;
          case GET_PROPOSALS:
            this.getProposals(payload);
            break;
          case GET_CURRENT_BLOCK:
            this.getCurrentBlock(payload);
            break;
          case GET_REWARDS_AVAILABLE:
            this.getRewardsAvailable(payload);
            break;
          case GET_REWARD:
            this.getReward(payload);
            break;
          case VOTE_FOR:
            this.voteFor(payload);
            break;
          case VOTE_AGAINST:
            this.voteAgainst(payload);
            break;

          case GET_KEEPER:
            this.getKeeper(payload);
            break;
          case GET_JOBS:
            this.getJobs(payload);
            break;
          case GET_KEEPERS:
            this.getKeepers(payload);
            break;
          case ADD_BOND:
            this.addBond(payload);
            break;
          case REMOVE_BOND:
            this.removeBond(payload);
            break;
          case ACTIVATE_BOND:
            this.activateBond(payload);
            break;
          case GET_KEEPER_PROFILE:
            this.getKeeperProfile(payload);
            break;
          case ADD_JOB:
            this.addJob(payload);
            break;
          case GET_JOB_PROFILE:
            this.getJobProfile(payload);
            break;
          case ADD_LIQUIDITY_TO_JOB:
            this.addLiquidityToJob(payload);
            break;
          case REMOVE_LIQUIDITY_FROM_JOB:
            this.removeLiquidityFromJob(payload);
            break;
          case APPLY_CREDIT_TO_JOB:
            this.applyCreditToJob(payload);
            break;
          case UNBOND_LIQUIDITY_FROM_JOB:
            this.unbondLiquidityFromJob(payload);
            break;
          case SLASH:
            this.slash(payload);
            break;
          default: {
          }
        }
      }.bind(this)
    );
  }

  getStore(index) {
    return(this.store[index]);
  };

  setStore(obj) {
    this.store = {...this.store, ...obj}
    return emitter.emit('StoreUpdated');
  };

  getBalances = async () => {
    const account = store.getStore('account')

    let baseAsset = store.getStore('baseAsset')
    let liquidityAsset = store.getStore('liquidityAsset')
    let rewardAsset = store.getStore('rewardAsset')
    // let poolAsset = store.getStore('poolAsset')
    let keeperAsset = store.getStore('keeperAsset')

    let assets = [baseAsset, liquidityAsset, rewardAsset] // ,poolAsset

    if(!account || !account.address || !assets) {
      return false
    }

    const web3 = await this._getWeb3Provider();

    async.map(assets, (asset, callback) => {
      async.parallel([
        (callbackInner) => { this._getBalance(web3, asset, account, callbackInner) },
      ], (err, data) => {

        asset.balance = data[0]

        callback(null, asset)
      })
    }, (err, resultAssets) => {
      if(err) {
        return emitter.emit(ERROR, err)
      }

      baseAsset = resultAssets[0]
      liquidityAsset = resultAssets[1]
      rewardAsset = resultAssets[2]
      // poolAsset = resultAssets[3]
      keeperAsset = resultAssets[4]

      store.setStore({ baseAsset: baseAsset, liquidityAsset: liquidityAsset, rewardAsset: rewardAsset }) //, poolAsset: poolAsset
      return emitter.emit(BALANCES_RETURNED)
    })
  }

  _getBalance = async (web3, asset, account, callback) => {
    try {
      if(asset.address === 'Ethereum') {
        const eth_balance = web3.utils.fromWei(await web3.eth.getBalance(account.address), "ether");
        callback(null, parseFloat(eth_balance))
      } else {
        const assetContract = new web3.eth.Contract(asset.abi, asset.address)

        let balance = await assetContract.methods.balanceOf(account.address).call({ from: account.address });
        balance = parseFloat(balance)/10**asset.decimals
        callback(null, parseFloat(balance))
      }
    } catch(ex) {
      console.log(ex)
      return callback(ex)
    }
  }


  calculateMint = async (payload) => {
    try {
      const account = store.getStore('account')
      const baseAsset = store.getStore('baseAsset')
      const liquidityAsset = store.getStore('liquidityAsset')
      const web3 = await this._getWeb3Provider();

      const { amount } = payload.content

      const liquidityContract = new web3.eth.Contract(LiquidityABI, liquidityAsset.address)

      let amountToSend = (amount*10**baseAsset.decimals).toFixed(0);

      const output = await liquidityContract.methods.calculateMint(amountToSend).call({ from: account.address })
      const receiveAmount = parseFloat(output)/10**liquidityAsset.decimals

      return emitter.emit(CALCULATE_MINT_RETURNED, receiveAmount)
    } catch(ex) {
      console.log(ex)
    }
  }

  mint = (payload) => {
    const account = store.getStore('account')
    const baseAsset = store.getStore('baseAsset')
    const { amount } = payload.content

    this._callMint(baseAsset, account, amount, (err, res) => {
      if(err) {
        emitter.emit(SNACKBAR_ERROR, err);
        return emitter.emit(ERROR, MINT);
      }

      return emitter.emit(MINT_RETURNED, res)
    })
  }

  _callMint = async (asset, account, amount, callback) => {
    const web3 = await this._getWeb3Provider();
    const amountToSend = (amount*10**asset.decimals).toFixed(0)

    const liquidityContract = new web3.eth.Contract(LiquidityABI, config.liquidityAddress)
    const output = await liquidityContract.methods.calculateMint(amountToSend).call({ from: account.address })

    liquidityContract.methods.mint(output).send({ value: amountToSend, from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(TX_SUBMITTED, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 2) {
          emitter.emit(TX_CONFIRMED, receipt.transactionHash)
        }
      })
      .on('receipt', function(receipt){
        emitter.emit(TX_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  stake = (payload) => {
    const account = store.getStore('account')
    const liquidityAsset = store.getStore('liquidityAsset')
    const { amount } = payload.content

    this._checkApproval(liquidityAsset, account, amount, config.rewardsAddress, (err) => {
      if(err) {
        emitter.emit(SNACKBAR_ERROR, err)
        return emitter.emit(ERROR, STAKE)
      }

      this._callStake(liquidityAsset, account, amount, (err, res) => {
        if(err) {
          emitter.emit(SNACKBAR_ERROR, err)
          return emitter.emit(ERROR, STAKE)
        }

        return emitter.emit(STAKE_RETURNED, res)
      })
    })
  }

  _callStake = async (asset, account, amount, callback) => {
    const web3 = await this._getWeb3Provider();
    const amountToSend = (amount*10**asset.decimals).toFixed(0)

    const rewardsContract = new web3.eth.Contract(RewardsABI, config.rewardsAddress)
    rewardsContract.methods.stake(amountToSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(TX_SUBMITTED, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 2) {
          emitter.emit(TX_CONFIRMED, receipt.transactionHash)
        }
      })
      .on('receipt', function(receipt){
        emitter.emit(TX_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }


  _checkApproval = async (asset, account, amount, contract, callback) => {
    const web3 = await this._getWeb3Provider()
    try {
      const erc20Contract = new web3.eth.Contract(ERC20ABI, asset.address)
      const allowance = await erc20Contract.methods.allowance(account.address, contract).call({ from: account.address })

      const ethAllowance = (allowance*10**asset.decimals).toFixed(0)
      let amountToSend = web3.utils.toWei('999999999', "ether");
      if(asset.decimals !== 18) {
        amountToSend = (999999999*10**asset.decimals).toFixed(0)
      }

      if(parseFloat(ethAllowance) < parseFloat(amount)) {
        await erc20Contract.methods.approve(contract, amountToSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        callback()
      } else {
        callback()
      }

    } catch(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    }
  }

  getGasPrices = async (payload) => {
    const gasPrices = await this._getGasPrices()
    let gasSpeed = localStorage.getItem('governance-gas-speed')

    if(!gasSpeed) {
      gasSpeed = 'fast'
      localStorage.getItem('governance-gas-speed', 'fast')
    }

    store.setStore({ gasPrices: gasPrices, gasSpeed: gasSpeed })
    emitter.emit(GAS_PRICES_RETURNED)
  }

  _getGasPrices = async () => {
    try {
      const url = config.gasPriceURL
      const priceString = await rp(url);
      const priceJSON = JSON.parse(priceString)
      if(priceJSON) {
        return priceJSON
      }
    } catch(e) {
      console.log(e)
      return {}
    }
  }

  _getGasPrice = async () => {
    const gasSpeed = store.getStore('gasSpeed')

    try {
      const url = config.gasPriceURL
      const priceString = await rp(url);
      const priceJSON = JSON.parse(priceString)
      if(priceJSON) {
        return priceJSON[gasSpeed].toFixed(0)
      }
    } catch(e) {
      console.log(e)
      return {}
    }
  }

  _getWeb3Provider = async () => {
    const web3context = store.getStore('web3context')
    if(!web3context) {
      return null
    }
    const provider = web3context.library.provider
    if(!provider) {
      return null
    }

    const web3 = new Web3(provider);

    return web3
  }

  signAction = async (payload) => {
    const { contract, func, params, paramValues } = payload.content
    const account = store.getStore('account')
    const web3 = await this._getWeb3Provider();
    if(!web3) return

    this._signActionBySig(web3, account, contract, func, params, paramValues, (err, result) => {
      if(err) {
        emitter.emit(SNACKBAR_ERROR, err);
        return emitter.emit(ERROR, SIGN_ACTION);
      }

      const retObj = {
        contract,
        func,
        result
      }

      return emitter.emit(SIGN_ACTION_RETURNED, retObj)
    })
  }

  _signActionBySig = async (web3, account, contract, func, params, paramValues, callback) => {

    const domain = [
      { name: "name", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ];

    const parameters = params.map((param) => {
      return {
        name: param.name,
        type: param.type
      }
    });

    const chainId = web3.currentProvider.networkVersion;

    const domainData = {
      name: func,
      version: "1",
      chainId: chainId,
      verifyingContract: contract.address
    };

    //map params to values
    let message = {}

    let i = 0
    for(i = 0; i < params.length; i++) {
      message[params[i].name] = paramValues[i]
    }

    const data = JSON.stringify({
      types: {
        EIP712Domain: domain,
        Params: parameters
      },
      domain: domainData,
      primaryType: "Params",
      message: message
    });


    const signer = web3.utils.toChecksumAddress(account.address);

    const that = this

    web3.currentProvider.sendAsync(
      {
        method: "eth_signTypedData_v3",
        params: [signer, data],
        from: signer
      },
      function(err, result) {
        if (err || result.error) {
          console.error(err || result.error);
          if(result && result.error && result.error.message) {
            return callback(result.error.message)
          }
          return callback(err || result.error)
        }

        const signature = that._parseSignature(result.result.substring(2));

        // const returnObj = {
        //   signer: signer,
        //   message: message,
        //   r: signature.r,
        //   s: signature.s,
        //   v: signature.v
        // }

        callback(null, signature)
      }
    );
  }

  _parseSignature = (signature) => {
    var r = signature.substring(0, 64);
    var s = signature.substring(64, 128);
    var v = signature.substring(128, 130);

    return {
        r: "0x" + r,
        s: "0x" + s,
        v: parseInt(v, 16)
    }
  }

  propose = async (payload) => {
    const { contracts, description } = payload.content
    const web3 = await this._getWeb3Provider()

    const targets = contracts.map((contract) => {
      return contract.address
    })
    const values = contracts.map((contract) => {
      return contract.value
    })
    const signatures = contracts.map((contract) => {
      const theContract = new web3.eth.Contract(contract.abi, contract.address)

      const signature = theContract.methods[contract.func]( ...contract.paramValues )._method.signature;
      return signature
    })
    const calldatas = contracts.map((contract) => {
      const theContract = new web3.eth.Contract(contract.abi, contract.address)
      const callData = theContract.methods[contract.func]( ...contract.paramValues ).encodeABI();
      return callData
    })

    this._callPropose(targets, values, signatures, calldatas, description, (err, res) => {
      if(err) {
        emitter.emit(SNACKBAR_ERROR, err);
        return emitter.emit(ERROR, PROPOSE);
      }

      return emitter.emit(PROPOSE_RETURNED, res)
    })
  }

  _callPropose = async (targets, values, signatures, calldatas, description, callback) => {
    const account = store.getStore('account')
    const web3 = await this._getWeb3Provider()

    console.log(targets)
    console.log(values)
    console.log(signatures)
    console.log(calldatas)
    console.log(description)

    const governanceContract = new web3.eth.Contract(GovernanceABI, config.governanceAddress)
    governanceContract.methods.propose(targets, values, signatures, calldatas, description).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(TX_SUBMITTED, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 1) {
          emitter.emit(TX_CONFIRMED, receipt.transactionHash)
        }
      })
      .on('receipt', function(receipt){
        emitter.emit(TX_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  getProposals = async (payload) => {
    const account = store.getStore('account')
    const web3 = await this._getWeb3Provider()

    if(!web3) {
      emitter.emit(GET_PROPOSALS_RETURNED)
      return
    }

    this._getProposalCount(web3, account, (err, proposalCount) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      let arr = Array.from(Array(parseInt(proposalCount)).keys()).reverse()

      if(proposalCount === 0 || proposalCount === '0') {
        arr = []
      }

      async.map(arr, (proposal, callback) => {
        proposal = proposal + 1
        this._getProposals(web3, account, proposal, callback)
      }, (err, proposalsData) => {
        if(err) {
          return emitter.emit(ERROR, err);
        }

        store.setStore({ proposals: proposalsData })
        emitter.emit(GET_PROPOSALS_RETURNED)
      })
    })
  }

  _getProposalCount = async (web3, account, callback) => {
    try {
      const governanceContract = new web3.eth.Contract(GovernanceABI, config.governanceAddress)
      const proposals = await governanceContract.methods.proposalCount().call({ from: account.address });
      callback(null, proposals)
    } catch(ex) {
      console.log(ex)
      return callback(ex)
    }
  }

  _getProposals = async (web3, account, number, callback) => {
    try {
      const governanceContract = new web3.eth.Contract(GovernanceABI, config.governanceAddress)
      let proposal = await governanceContract.methods.proposals(number).call({ from: account.address });
      const receipt = await governanceContract.methods.getReceipt(number, account.address).call({ from: account.address });
      const actions = await governanceContract.methods.getActions(number).call({ from: account.address });
      let state = await governanceContract.methods.state(number).call({ from: account.address });

      proposal.receipt = receipt
      proposal.actions = actions
      proposal.state = state
      proposal.stateDescription = this._getState(state)

      callback(null, proposal)
    } catch(ex) {
      return callback(ex)
    }
  }

  _getState = (num) => {
    switch (num) {
      case '0':
        return "Pending"
      case '1':
        return "Active"
      case '2':
        return "Canceled"
      case '3':
        return "Defeated"
      case '4':
        return "Succeeded"
      case '5':
        return "Queued"
      case '6':
        return "Expired"
      case '7':
        return "Executed"
      default:
        return "Pending"
    }
  }

  getCurrentBlock = async () => {
    const web3 = await this._getWeb3Provider()

    if(!web3) {
      emitter.emit(CURRENT_BLOCK_RETURNED)
      return
    }

    const currentBlock = await web3.eth.getBlockNumber()

    store.setStore({ currentBlock: currentBlock })

    window.setTimeout(() => {
      emitter.emit(CURRENT_BLOCK_RETURNED)
    }, 100)
  }

  getRewardsAvailable = async () => {
    try {
      const account = store.getStore('account')
      const rewardAsset = store.getStore('rewardAsset')
      const web3 = await this._getWeb3Provider();

      const rewardsContract = new web3.eth.Contract(RewardsABI, rewardAsset.address)

      const output = await rewardsContract.methods.rewards(account.address).call({ from: account.address })
      const rewardAmount = parseFloat(output)/10**rewardAsset.decimals

      return emitter.emit(REWARDS_AVAILABLE_RETURNED, rewardAmount)
    } catch(ex) {
      console.log(ex)
      emitter.emit(SNACKBAR_ERROR, ex);
      return emitter.emit(ERROR, GET_REWARDS_AVAILABLE)
    }
  }

  getReward = (payload) => {
    const account = store.getStore('account')
    const baseAsset = store.getStore('baseAsset')
    const { amount } = payload.content

    this._callGetReward(baseAsset, account, amount, (err, res) => {
      if(err) {
        emitter.emit(SNACKBAR_ERROR, err);
        return emitter.emit(ERROR, GET_REWARD);
      }

      return emitter.emit(REWARD_RETURNED, res)
    })
  }

  _callGetReward = async (asset, account, amount, callback) => {
    const web3 = await this._getWeb3Provider();

    const rewardsContract = new web3.eth.Contract(RewardsABI, config.rewardsAddress)

    rewardsContract.methods.getReward().send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(TX_SUBMITTED, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 2) {
          emitter.emit(TX_CONFIRMED, receipt.transactionHash)
        }
      })
      .on('receipt', function(receipt){
        emitter.emit(TX_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  voteFor = (payload) => {
    const account = store.getStore('account')
    const { proposal } = payload.content

    this._callVoteFor(proposal, account, (err, res) => {
      if(err) {
        emitter.emit(SNACKBAR_ERROR, err);
        return emitter.emit(ERROR, GET_REWARD);
      }

      return emitter.emit(VOTE_FOR_RETURNED, res)
    })
  }

  _callVoteFor = async (proposal, account, callback) => {
    const web3 = await this._getWeb3Provider();

    const governanceContract = new web3.eth.Contract(GovernanceABI, config.governanceAddress)

    governanceContract.methods.castVote(proposal.id, true).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(TX_SUBMITTED, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 2) {
          emitter.emit(TX_CONFIRMED, receipt.transactionHash)
        }
      })
      .on('receipt', function(receipt){
        emitter.emit(TX_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  voteAgainst = (payload) => {
    const account = store.getStore('account')
    const { proposal } = payload.content

    this._callVoteAgainst(proposal, account, (err, res) => {
      if(err) {
        emitter.emit(SNACKBAR_ERROR, err);
        return emitter.emit(ERROR, GET_REWARD);
      }

      return emitter.emit(VOTE_AGAINST_RETURNED, res)
    })
  }

  _callVoteAgainst = async (proposal, account, callback) => {
    const web3 = await this._getWeb3Provider();

    const governanceContract = new web3.eth.Contract(GovernanceABI, config.governanceAddress)

    governanceContract.methods.castVote(proposal.id, false).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(TX_SUBMITTED, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 2) {
          emitter.emit(TX_CONFIRMED, receipt.transactionHash)
        }
      })
      .on('receipt', function(receipt){
        emitter.emit(TX_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }


  getKeeper = async (payload) => {
    const account = store.getStore('account')
    let keeperAsset = store.getStore('keeperAsset')
    const web3 = await this._getWeb3Provider()
    if(!web3) {
      emitter.emit(KEEPER_RETURNED)
      return
    }

    try {

      keeperAsset = await this._getKeeperData(web3, keeperAsset, account.address)

      store.setStore({ keeperAsset: keeperAsset })

      emitter.emit(KEEPER_RETURNED)

    } catch(ex) {
      emitter.emit(SNACKBAR_ERROR, ex)
      return emitter.emit(ERROR, GET_KEEPER)
    }
  }

  _getKeeperData = async (web3, keeperAsset, address) => {

    try {
      const keeperContract = new web3.eth.Contract(KeeperABI, config.keeperAddress)

      let balance = await keeperContract.methods.balanceOf(address).call({ })
      balance = balance/10**keeperAsset.decimals
      keeperAsset.balance = balance

      let bonds = await keeperContract.methods.bonds(address, keeperAsset.address).call({ })
      bonds = bonds/10**keeperAsset.decimals
      keeperAsset.bonds = bonds

      let pendingBonds = await keeperContract.methods.pendingbonds(address, keeperAsset.address).call({ })
      pendingBonds = pendingBonds/10**keeperAsset.decimals
      keeperAsset.pendingBonds = pendingBonds

      keeperAsset.bondings = await keeperContract.methods.bondings(address, keeperAsset.address).call({ })
      keeperAsset.unbondings = await keeperContract.methods.unbondings(address, keeperAsset.address).call({ })

      keeperAsset.blacklisted = await keeperContract.methods.blacklist(address).call({ })
      keeperAsset.disputed = await keeperContract.methods.disputes(address).call({ })
      keeperAsset.firstSeen = await keeperContract.methods.firstSeen(address).call({ })
      keeperAsset.delegates = await keeperContract.methods.delegates(address).call({ })

      keeperAsset.workCompleted = await keeperContract.methods.workCompleted(address).call({ })
      keeperAsset.workCompleted = keeperAsset.workCompleted/10**keeperAsset.decimals

      keeperAsset.lastJob = await keeperContract.methods.lastJob(address).call({ })

      keeperAsset.isActive = await keeperContract.methods.keepers(address).call({ })

      keeperAsset.currentVotes = await keeperContract.methods.getCurrentVotes(address).call({ })

      console.log(keeperAsset)
      return keeperAsset
    } catch(ex) {
      console.log(ex)
      return {}
    }
  }

  getJobs = async (payload) => {
    const account = store.getStore('account')
    const web3 = await this._getWeb3Provider()
    const keeperAsset = store.getStore('keeperAsset')

    if(!web3) {
      emitter.emit(JOBS_RETURNED)
      return
    }

    try {
      const keeperContract = new web3.eth.Contract(KeeperABI, config.keeperAddress)
      const jobs = await keeperContract.methods.getJobs().call({ from: account.address });

      async.map(jobs, async (job, callback) => {
        let jobProfile = await this._getJobData(web3, keeperAsset, job)
        jobProfile.address = job

        if(callback) {
          callback(null, jobProfile)
        } else {
          return jobProfile
        }
      }, (err, jobsData) => {
        if(err) {
          emitter.emit(SNACKBAR_ERROR, err);
          return emitter.emit(ERROR, GET_JOBS);
        }

        store.setStore({ jobs: jobsData })
        emitter.emit(JOBS_RETURNED)
      })

    } catch(ex) {
      emitter.emit(SNACKBAR_ERROR, ex)
      return emitter.emit(ERROR, GET_JOBS)
    }
  }

  getKeepers = async (payload) => {
    const account = store.getStore('account')
    const web3 = await this._getWeb3Provider()
    if(!web3) {
      emitter.emit(KEEPERS_RETURNED)
      return
    }

    try {
      const keeperContract = new web3.eth.Contract(KeeperABI, config.keeperAddress)

      const keepers = await keeperContract.methods.getKeepers().call({ from: account.address })

      store.setStore({ keepers: keepers })

      emitter.emit(KEEPERS_RETURNED)
    } catch(ex) {
      emitter.emit(SNACKBAR_ERROR, ex)
      return emitter.emit(ERROR, GET_KEEPERS)
    }
  }

  addBond = (payload) => {
    const account = store.getStore('account')
    const { amount } = payload.content

    this._callBond(amount, account, (err, res) => {
      if(err) {
        emitter.emit(SNACKBAR_ERROR, err);
        return emitter.emit(ERROR, ADD_BOND);
      }

      return emitter.emit(ADD_BOND_RETURNED, res)
    })
  }

  _callBond = async (amount, account, callback) => {
    const web3 = await this._getWeb3Provider();
    const keeperAsset = store.getStore('keeperAsset')

    const keeperContract = new web3.eth.Contract(KeeperABI, config.keeperAddress)

    let amountToSend = (amount*10**keeperAsset.decimals).toFixed(0);

    keeperContract.methods.bond(keeperAsset.address, amountToSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(TX_SUBMITTED, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 2) {
          emitter.emit(TX_CONFIRMED, receipt.transactionHash)
        }
      })
      .on('receipt', function(receipt){
        emitter.emit(TX_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  removeBond = (payload) => {
    const account = store.getStore('account')
    const { amount } = payload.content

    this._callUnbond(amount, account, (err, res) => {
      if(err) {
        emitter.emit(SNACKBAR_ERROR, err);
        return emitter.emit(ERROR, REMOVE_BOND);
      }

      return emitter.emit(REMOVE_BOND_RETURNED, res)
    })
  }

  _callUnbond = async (amount, account, callback) => {
    const web3 = await this._getWeb3Provider();
    const keeperAsset = store.getStore('keeperAsset')

    const keeperContract = new web3.eth.Contract(KeeperABI, config.keeperAddress)

    let amountToSend = (amount*10**keeperAsset.decimals).toFixed(0);

    keeperContract.methods.unbond(keeperAsset.address, amountToSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(TX_SUBMITTED, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 2) {
          emitter.emit(TX_CONFIRMED, receipt.transactionHash)
        }
      })
      .on('receipt', function(receipt){
        emitter.emit(TX_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  activateBond = (payload) => {
    const account = store.getStore('account')

    this._callActivate(account, (err, res) => {
      if(err) {
        emitter.emit(SNACKBAR_ERROR, err);
        return emitter.emit(ERROR, ACTIVATE_BOND);
      }

      return emitter.emit(ACTIVATE_BOND_RETURNED, res)
    })
  }

  _callActivate = async (account, callback) => {
    const web3 = await this._getWeb3Provider();
    const keeperAsset = store.getStore('keeperAsset')

    const keeperContract = new web3.eth.Contract(KeeperABI, config.keeperAddress)

    keeperContract.methods.activate(keeperAsset.address).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(TX_SUBMITTED, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 2) {
          emitter.emit(TX_CONFIRMED, receipt.transactionHash)
        }
      })
      .on('receipt', function(receipt){
        emitter.emit(TX_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  getKeeperProfile = async (payload) => {
    const keeperAsset = store.getStore('keeperAsset')
    const web3 = await this._getWeb3Provider()
    if(!web3) {
      emitter.emit(KEEPER_PROFILE_RETURNED, {})
      return
    }

    try {

      let keeperProfile = await this._getKeeperData(web3, keeperAsset, payload.content.address)
      keeperProfile.profileAddress = payload.content.address

      emitter.emit(KEEPER_PROFILE_RETURNED, keeperProfile)

    } catch(ex) {
      emitter.emit(SNACKBAR_ERROR, ex)
      return emitter.emit(ERROR, GET_KEEPER_PROFILE)
    }
  }

  addJob = async (payload) => {
    const account = store.getStore('account')

    const { address, addLiquidityAmount, name, docs, ipfs } = payload.content

    this._callAddLiquidityToJob(account, address, addLiquidityAmount, async (err, res) => {
      if(err) {
        emitter.emit(SNACKBAR_ERROR, err);
        return emitter.emit(ERROR, ADD_JOB);
      }

      const governanceAddress = await this._getGovernanceAddress()
      if(governanceAddress.toLowerCase() === account.address.toLowerCase() && (name !== '' || docs !== '' || ipfs !== '')) {
        this._callAdd(account, address, name, docs, ipfs, (err, res) => {
          if(err) {
            emitter.emit(SNACKBAR_ERROR, err);
            return emitter.emit(ERROR, ADD_JOB);
          }

          return emitter.emit(ADD_JOB_RETURNED, res)
        })

      } else {
        return emitter.emit(ADD_JOB_RETURNED, res)
      }
    })
  }

  _getGovernanceAddress = async () => {
    try {
      const web3 = await this._getWeb3Provider();
      const jobRegistryContract = new web3.eth.Contract(JobRegistryABI, config.jobRegistryAddress)

      const address = await jobRegistryContract.methods.governance().call({})
      return address
    } catch(ex) {
      console.log(ex)
      return null
    }
  }

  _callAdd = async (account, address, name, docs, ipfs, callback) => {
    const web3 = await this._getWeb3Provider();

    const jobRegistryContract = new web3.eth.Contract(JobRegistryABI, config.jobRegistryAddress)

    jobRegistryContract.methods.add(address, name, ipfs, docs).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(TX_SUBMITTED, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 2) {
          emitter.emit(TX_CONFIRMED, receipt.transactionHash)
        }
      })
      .on('receipt', function(receipt){
        emitter.emit(TX_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  _callAddLiquidityToJob = async (account, address, amount, callback) => {
    const web3 = await this._getWeb3Provider();
    const keeperAsset = store.getStore('keeperAsset')

    const keeperContract = new web3.eth.Contract(KeeperABI, config.keeperAddress)

    let amountToSend = (amount*10**keeperAsset.decimals).toFixed(0);

    keeperContract.methods.addLiquidityToJob(keeperAsset.address, address, amountToSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(TX_SUBMITTED, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 2) {
          emitter.emit(TX_CONFIRMED, receipt.transactionHash)
        }
      })
      .on('receipt', function(receipt){
        emitter.emit(TX_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  getJobProfile = async (payload) => {
    let keeperAsset = store.getStore('keeperAsset')
    const web3 = await this._getWeb3Provider()
    if(!web3) {
      emitter.emit(JOB_PROFILE_RETURNED, {})
      return
    }

    try {

      let jobProfile = await this._getJobData(web3, keeperAsset, payload.content.address)
      jobProfile.address = payload.content.address

      emitter.emit(JOB_PROFILE_RETURNED, jobProfile)

    } catch(ex) {
      emitter.emit(SNACKBAR_ERROR, ex)
      return emitter.emit(ERROR, GET_JOB_PROFILE)
    }
  }

  _getJobData = async (web3, keeperAsset, address) => {
    try {
      const keeperContract = new web3.eth.Contract(KeeperABI, config.keeperAddress)
      const jobRegistryContract = new web3.eth.Contract(JobRegistryABI, config.jobRegistryAddress)

      const isJob = await keeperContract.methods.jobs(address).call({ })
      if(!isJob) {
        return {
          isJob: false
        }
      }

      let jobProfile = await jobRegistryContract.methods.jobData(address).call({ })
      if(!jobProfile) {
        jobProfile = {}
      }

      const jobAdded = await jobRegistryContract.methods.jobAdded(address).call({ })
      jobProfile.jobAdded = jobAdded

      let credits = await keeperContract.methods.credits(address, keeperAsset.address).call({ })
      credits = credits/10**keeperAsset.decimals

      jobProfile.credits = credits
      jobProfile.isJob = isJob

      return jobProfile
    } catch(ex) {
      console.log(ex)
      return {
        credits: 0
      }
    }
  }



  addLiquidityToJob = async (payload) => {
    const account = store.getStore('account')

    const { address, addLiquidityAmount } = payload.content

    this._callAddLiquidityToJob(account, address, addLiquidityAmount, (err, res) => {
      if(err) {
        emitter.emit(SNACKBAR_ERROR, err);
        return emitter.emit(ERROR, ADD_LIQUIDITY_TO_JOB);
      }

      return emitter.emit(ADD_LIQUIDITY_TO_JOB_RETURNED, res)
    })
  }

  applyCreditToJob = async (payload) => {
    const account = store.getStore('account')

    const { address } = payload.content

    this._callApplyCreditToJob(account, address, (err, res) => {
      if(err) {
        emitter.emit(SNACKBAR_ERROR, err);
        return emitter.emit(ERROR, APPLY_CREDIT_TO_JOB);
      }

      return emitter.emit(APPLY_CREDIT_TO_JOB_RETURNED, res)
    })
  }

  _callApplyCreditToJob = async (account, address, callback) => {
    const web3 = await this._getWeb3Provider();
    const keeperAsset = store.getStore('keeperAsset')

    const keeperContract = new web3.eth.Contract(KeeperABI, config.keeperAddress)

    keeperContract.methods.applyCreditToJob(account.address, keeperAsset.address, address).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(TX_SUBMITTED, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 2) {
          emitter.emit(TX_CONFIRMED, receipt.transactionHash)
        }
      })
      .on('receipt', function(receipt){
        emitter.emit(TX_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }


  unbondLiquidityFromJob = async (payload) => {
    const account = store.getStore('account')

    const { address, removeLiquidityAmount } = payload.content

    this._callUnbondLiquidityFromJob(account, address, removeLiquidityAmount, (err, res) => {
      if(err) {
        emitter.emit(SNACKBAR_ERROR, err);
        return emitter.emit(ERROR, UNBOND_LIQUIDITY_FROM_JOB);
      }

      return emitter.emit(UNBOND_LIQUIDITY_FROM_JOB_RETURNED, res)
    })
  }

  _callUnbondLiquidityFromJob = async (account, address, amount, callback) => {
    const web3 = await this._getWeb3Provider();
    const keeperAsset = store.getStore('keeperAsset')

    const keeperContract = new web3.eth.Contract(KeeperABI, config.keeperAddress)

    let amountToSend = (amount*10**keeperAsset.decimals).toFixed(0);

    keeperContract.methods.unbondLiquidityFromJob(keeperAsset.address, address, amountToSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(TX_SUBMITTED, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 2) {
          emitter.emit(TX_CONFIRMED, receipt.transactionHash)
        }
      })
      .on('receipt', function(receipt){
        emitter.emit(TX_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  removeLiquidityFromJob = async (payload) => {
    const account = store.getStore('account')

    const { address } = payload.content

    this._callRemoveLiquidityFromJob(account, address, (err, res) => {
      if(err) {
        emitter.emit(SNACKBAR_ERROR, err);
        return emitter.emit(ERROR, REMOVE_LIQUIDITY_FROM_JOB);
      }

      return emitter.emit(REMOVE_LIQUIDITY_FROM_JOB_RETURNED, res)
    })
  }

  _callRemoveLiquidityFromJob = async (account, address, callback) => {
    const web3 = await this._getWeb3Provider();
    const keeperAsset = store.getStore('keeperAsset')

    const keeperContract = new web3.eth.Contract(KeeperABI, config.keeperAddress)

    keeperContract.methods.removeLiquidityFromJob(keeperAsset.address, address).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(TX_SUBMITTED, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 2) {
          emitter.emit(TX_CONFIRMED, receipt.transactionHash)
        }
      })
      .on('receipt', function(receipt){
        emitter.emit(TX_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  slash = async (payload) => {
    const account = store.getStore('account')

    const { address } = payload.content

    this._callDown(account, address, (err, res) => {
      if(err) {
        emitter.emit(SNACKBAR_ERROR, err);
        return emitter.emit(ERROR, SLASH);
      }

      return emitter.emit(SLASH_RETURNED, res)
    })
  }

  _callDown = async (account, address, callback) => {
    const web3 = await this._getWeb3Provider();

    const keeperContract = new web3.eth.Contract(KeeperABI, config.keeperAddress)

    keeperContract.methods.down(address).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(TX_SUBMITTED, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 2) {
          emitter.emit(TX_CONFIRMED, receipt.transactionHash)
        }
      })
      .on('receipt', function(receipt){
        emitter.emit(TX_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }
}

var store = new Store();

export default {
  store: store,
  dispatcher: dispatcher,
  emitter: emitter
};
