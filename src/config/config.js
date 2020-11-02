require('dotenv').config()

const config = {
  infuraProvider: process.env.REACT_APP_PROVIDER,
  gasPriceURL: process.env.REACT_APP_GAS_PRICE_API,
  githubAPI: process.env.REaCT_APP_GITHUB_API,
  etherscanAPI: process.env.REACT_APP_ETHERSCAN_API,
  etherscanAPIKey: process.env.REACT_APP_ETHERSCAN_KEY,

  liquidityAddress: '0x375Da3e307Ef2E1A9D9e1516f80738Ca52cb7B85',
  governanceAddress: '0x71c882bC3191b36bbE839e55dec2e03024943DCD',
  rewardsAddress: '0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44',

  keeperAddress: '0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44',
  jobRegistryAddress: '0x7396899638410094b3690f8bd2b56f07fdab620c',

};

export default config;
