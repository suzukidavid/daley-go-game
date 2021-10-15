const { ASSET_HOST } = process.env
const { i18n } = require('./next-i18next.config')

const withTM = require('next-transpile-modules')([
  '@blocto/sdk',
  '@solana/wallet-adapter-base',
  '@solana/wallet-adapter-react',
  '@solana/wallet-adapter-wallets',
  '@solana/wallet-adapter-react-ui',
  //'@solana/wallet-adapter-bitkeep',
  '@solana/wallet-adapter-bitpie',
  '@solana/wallet-adapter-blocto',
  '@solana/wallet-adapter-clover',
  '@solana/wallet-adapter-coin98',
  '@solana/wallet-adapter-ledger',
  '@solana/wallet-adapter-mathwallet',
  '@solana/wallet-adapter-phantom',
  '@solana/wallet-adapter-safepal',
  '@solana/wallet-adapter-slope',
  '@solana/wallet-adapter-solflare',
  '@solana/wallet-adapter-sollet',
  '@solana/wallet-adapter-solong',
  '@solana/wallet-adapter-torus',
  //'@solana/wallet-adapter-walletconnect',
]); // pass the modules you would like to see transpiled

module.exports = withTM({
  reactStrictMode: true,
  webpack5: true,
  webpack: (config, { isServer }) => {
    if ( !isServer ) {
      config.resolve.fallback = { 
        fs: false, 
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  i18n,
})
